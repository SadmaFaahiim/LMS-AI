const pool = require("../config/database");
const axios = require("axios");

class QuestionController {
  parseJsonField(value, fallback = null) {
    if (value === null || value === undefined) {
      return fallback;
    }

    if (typeof value !== "string") {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  serializeQuestion(row) {
    return {
      ...row,
      options: this.parseJsonField(row.options, row.options),
      metadata: this.parseJsonField(row.metadata, {}),
    };
  }

  /**
   * Store questions from RAG API response to database
   */
  async storeQuestionsFromRAG(req, res) {
    try {
      const { success, data } = req.body;

      if (!success || !data || !Array.isArray(data)) {
        return res.status(400).json({
          success: false,
          message: "Invalid API response format",
        });
      }

      const results = {
        inserted: [],
        failed: [],
        total: data.length,
      };

      // Process each question
      for (const question of data) {
        try {
          // Get or create subject (you might want to map based on topic)
          const subjectId = await this.getOrCreateSubject(question.topic);

          // Get or create topic
          const topicId = await this.getOrCreateTopic(
            subjectId,
            question.topic,
          );

          // Prepare question data
          const questionData = this.prepareQuestionData(
            question,
            subjectId,
            topicId,
          );

          // Insert question
          const insertedId = await this.insertQuestion(questionData);

          results.inserted.push({
            id: insertedId,
            question_text: question.question_text,
            type: question.type,
          });
        } catch (error) {
          console.error(
            `Failed to insert question: ${question.question_text}`,
            error,
          );
          results.failed.push({
            question_text: question.question_text,
            error: error.message,
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Successfully inserted ${results.inserted.length} out of ${results.total} questions`,
        data: results,
      });
    } catch (error) {
      console.error("Error storing questions:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to store questions",
        error: error.message,
      });
    }
  }

  /**
   * Stream questions from RAG API and store them
   */
  async streamAndStoreQuestions(req, res) {
    try {
      const {
        subject,
        topic,
        exam,
        grade,
        type,
        difficulty,
        count,
        language,
        focusOnBoardStyle,
      } = req.body;

      // SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      // Axios streaming request
      const response = await axios({
        method: "POST",
        url: `${process.env.RAG_API_URL}/api/generator/practice-questions/stream`,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          subject,
          topic,
          exam,
          grade,
          type,
          difficulty,
          count,
          language,
          focusOnBoardStyle,
        },
        responseType: "stream", // 🔥 important
      });

      const stream = response.data;

      let buffer = "";

      stream.on("data", async (chunk) => {
        buffer += chunk.toString();

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            // Forward to client
            res.write(`data: ${data}\n\n`);

            // Handle "done"
            try {
              const parsed = JSON.parse(data);

              if (parsed.stage === "done" && parsed.questions) {
                await this.storeGeneratedQuestions(parsed.questions, {
                  subject,
                  topic,
                  exam,
                  grade,
                  type,
                  difficulty,
                  language,
                });
              }
            } catch (e) {
              // ignore non-json
            }
          }
        }
      });

      stream.on("end", () => {
        if (buffer.startsWith("data: ")) {
          res.write(`${buffer}\n\n`);
        }
        res.end();
      });

      stream.on("error", (err) => {
        console.error("Stream error:", err);
        res.write(
          `data: ${JSON.stringify({
            stage: "error",
            message: err.message,
          })}\n\n`,
        );
        res.end();
      });
    } catch (error) {
      console.error("Error streaming questions:", error);

      res.write(
        `data: ${JSON.stringify({
          stage: "error",
          message: error.message,
        })}\n\n`,
      );
      res.end();
    }
  }

  /**
   * Store generated questions from RAG
   */
  async storeGeneratedQuestions(questions, metadata) {
    try {
      const subjectId = await this.getOrCreateSubject(metadata.topic);
      const topicId = await this.getOrCreateTopic(subjectId, metadata.topic);

      for (const question of questions) {
        const questionData = this.prepareQuestionData(
          question,
          subjectId,
          topicId,
        );
        questionData.metadata = JSON.stringify({
          generation_metadata: metadata,
          source_exam: metadata.exam,
          source_grade: metadata.grade,
        });

        await this.insertQuestion(questionData);
      }
    } catch (error) {
      console.error("Error storing generated questions:", error);
      throw error;
    }
  }

  /**
   * Prepare question data for insertion
   */
  prepareQuestionData(question, subjectId, topicId) {
    // Determine if evaluation is needed based on question type
    const needEvaluation = ["short", "broad", "creative"].includes(
      question.type,
    );

    // Prepare options based on question type
    let options = null;
    if (question.type === "mcq" && question.options) {
      options = JSON.stringify(question.options);
    }

    const baseData = {
      subject_id: subjectId,
      topic_id: topicId,
      question_text: question.question_text,
      question_text_en: question.question_text_en || null,
      type: question.type,
      difficulty: question.difficulty || "medium",
      marks: question.marks || 1,
      options: options,
      answer: question.answer || null,
      answer_bn: question.answer_bn || null,
      explanation: question.explanation || null,
      explanation_bn: question.explanation_bn || null,
      topic: question.topic || null,
      subtopic: question.subtopic || null,
      hint: question.hint || null,
      source: "ai", // Since coming from RAG
      source_reference: question.source || "rag-generated",
      need_evaluation: needEvaluation,
      status: "draft", // Default status, admin can publish later
      is_published: false,
      has_figure: question.has_figure || false,
      has_formula: question.hasFormula || false,
      bloom_level: question.bloom_level || null,
      metadata: JSON.stringify({}),
    };

    return baseData;
  }

  /**
   * Insert a single question into database
   */
  async insertQuestion(questionData) {
    const query = `
            INSERT INTO questions (
                subject_id, topic_id, question_text, question_text_en, type, difficulty, marks,
                options, answer, answer_bn, explanation, explanation_bn, topic, subtopic, hint,
                source, source_reference, need_evaluation, status, is_published, has_figure,
                has_formula, bloom_level, metadata, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20, $21, $22, $23, $24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING id
        `;

    const values = [
      questionData.subject_id,
      questionData.topic_id,
      questionData.question_text,
      questionData.question_text_en,
      questionData.type,
      questionData.difficulty,
      questionData.marks,
      questionData.options,
      questionData.answer,
      questionData.answer_bn,
      questionData.explanation,
      questionData.explanation_bn,
      questionData.topic,
      questionData.subtopic,
      questionData.hint,
      questionData.source,
      questionData.source_reference,
      questionData.need_evaluation,
      questionData.status,
      questionData.is_published,
      questionData.has_figure,
      questionData.has_formula,
      questionData.bloom_level,
      questionData.metadata,
    ];

    const result = await pool.query(query, values);
    return result.rows[0].id;
  }

  /**
   * Get or create subject
   */
  async getOrCreateSubject(subjectName) {
    if (!subjectName) return null;

    // Try to find existing subject
    const findQuery = "SELECT id FROM subjects WHERE LOWER(name) = LOWER($1)";
    const findResult = await pool.query(findQuery, [subjectName]);

    if (findResult.rows.length > 0) {
      return findResult.rows[0].id;
    }

    // Create new subject
    const insertQuery = "INSERT INTO subjects (name) VALUES ($1) RETURNING id";
    const insertResult = await pool.query(insertQuery, [subjectName]);
    return insertResult.rows[0].id;
  }

  /**
   * Get or create topic
   */
  async getOrCreateTopic(subjectId, topicName) {
    if (!topicName || !subjectId) return null;

    // Try to find existing topic
    const findQuery =
      "SELECT id FROM topics WHERE subject_id = $1 AND LOWER(name) = LOWER($2)";
    const findResult = await pool.query(findQuery, [subjectId, topicName]);

    if (findResult.rows.length > 0) {
      return findResult.rows[0].id;
    }

    // Create new topic
    const insertQuery =
      "INSERT INTO topics (subject_id, name) VALUES ($1, $2) RETURNING id";
    const insertResult = await pool.query(insertQuery, [subjectId, topicName]);
    return insertResult.rows[0].id;
  }

  /**
   * Bulk publish questions
   */
  async publishQuestions(req, res) {
    try {
      const { question_ids } = req.body;

      if (!question_ids || !Array.isArray(question_ids)) {
        return res.status(400).json({
          success: false,
          message: "question_ids array is required",
        });
      }

      const query = `
                UPDATE questions 
                SET is_published = true, status = 'published', updated_at = CURRENT_TIMESTAMP
                WHERE id = ANY($1::int[])
                RETURNING id
            `;

      const result = await pool.query(query, [question_ids]);

      return res.status(200).json({
        success: true,
        message: `Published ${result.rowCount} questions`,
        published_ids: result.rows.map((r) => r.id),
      });
    } catch (error) {
      console.error("Error publishing questions:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to publish questions",
        error: error.message,
      });
    }
  }

  /**
   * Get a single question by ID
   */
  async getQuestionById(req, res) {
      try {
          const { id } = req.params;
          const query = 'SELECT * FROM questions WHERE id = $1';
          const result = await pool.query(query, [id]);

          if (result.rows.length === 0) {
              return res.status(404).json({
                  success: false,
                  message: 'Question not found'
              });
          }

          const question = result.rows[0];
          if (question.options) {
              question.options = JSON.parse(question.options);
          }

          return res.status(200).json({
              success: true,
              data: question
          });
      } catch (error) {
          console.error('Error fetching question:', error);
          return res.status(500).json({
              success: false,
              message: 'Failed to fetch question',
              error: error.message
          });
      }
  }

  /**
   * Get questions with filters
   */  async getQuestions(req, res) {
    try {
      const {
        type,
        status,
        is_published,
        subject_id,
        topic_id,
        difficulty,
        limit = 50,
        offset = 0,
      } = req.query;

      let query = "SELECT * FROM questions WHERE 1=1";
      let countQuery = "SELECT COUNT(*) FROM questions WHERE 1=1";
      const values = [];
      let paramIndex = 1;

      if (type) {
        query += ` AND type = $${paramIndex++}`;
        countQuery += ` AND type = $${paramIndex - 1}`;
        values.push(type);
      }
      if (status) {
        query += ` AND status = $${paramIndex++}`;
        countQuery += ` AND status = $${paramIndex - 1}`;
        values.push(status);
      }
      if (is_published !== undefined) {
        query += ` AND is_published = $${paramIndex++}`;
        countQuery += ` AND is_published = $${paramIndex - 1}`;
        values.push(is_published === "true");
      }
      if (subject_id) {
        query += ` AND subject_id = $${paramIndex++}`;
        countQuery += ` AND subject_id = $${paramIndex - 1}`;
        values.push(parseInt(subject_id));
      }
      if (topic_id) {
        query += ` AND topic_id = $${paramIndex++}`;
        countQuery += ` AND topic_id = $${paramIndex - 1}`;
        values.push(parseInt(topic_id));
      }
      if (difficulty) {
        query += ` AND difficulty = $${paramIndex++}`;
        countQuery += ` AND difficulty = $${paramIndex - 1}`;
        values.push(difficulty);
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      values.push(parseInt(limit), parseInt(offset));

      const result = await pool.query(query, values);
      const countResult = await pool.query(
        countQuery,
        values.slice(0, values.length - 2),
      );

      return res.status(200).json({
        success: true,
        data: result.rows.map((row) => this.serializeQuestion(row)),
        pagination: {
          total: parseInt(countResult.rows[0].count),
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      console.error("Error fetching questions:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch questions",
        error: error.message,
      });
    }
  }

  /**
   * Update a question
   */
  async updateQuestion(req, res) {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid question id",
        });
      }

      const allowedFields = [
        "question_text",
        "question_text_en",
        "type",
        "difficulty",
        "marks",
        "options",
        "answer",
        "answer_bn",
        "explanation",
        "explanation_bn",
        "topic",
        "subtopic",
        "hint",
        "status",
        "is_published",
        "has_figure",
        "has_formula",
        "bloom_level",
        "metadata",
        "source_reference",
        "need_evaluation",
      ];

      const updates = {};
      for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
          updates[field] = req.body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields provided for update",
        });
      }

      if (Object.prototype.hasOwnProperty.call(updates, "marks")) {
        updates.marks = Number(updates.marks) || 1;
      }

      if (
        Object.prototype.hasOwnProperty.call(updates, "metadata") &&
        typeof updates.metadata !== "string"
      ) {
        updates.metadata = JSON.stringify(updates.metadata || {});
      }

      if (Object.prototype.hasOwnProperty.call(updates, "options")) {
        if (Array.isArray(updates.options)) {
          updates.options = JSON.stringify(updates.options);
        } else if (updates.options === null || updates.options === "") {
          updates.options = null;
        }
      }

      if (
        Object.prototype.hasOwnProperty.call(updates, "type") &&
        !Object.prototype.hasOwnProperty.call(updates, "need_evaluation")
      ) {
        updates.need_evaluation = ["short", "broad", "creative"].includes(
          updates.type,
        );
      }

      const entries = Object.entries(updates);
      const setClause = entries
        .map(([field], index) => `${field} = $${index + 1}`)
        .join(", ");
      const values = entries.map(([, value]) => value);
      values.push(id);

      const query = `
                UPDATE questions
                SET ${setClause}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $${values.length}
                RETURNING *
            `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Question not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Question updated successfully",
        data: this.serializeQuestion(result.rows[0]),
      });
    } catch (error) {
      console.error("Error updating question:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update question",
        error: error.message,
      });
    }
  }
}

module.exports = new QuestionController();
