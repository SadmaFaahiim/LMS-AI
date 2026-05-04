const { pool } = require("../config/database");

class GradingController {
  /**
   * Get all submissions for an exam with summary stats
   */
  async getExamSubmissions(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT
          s.id,
          s.exam_id,
          s.student_name,
          s.score,
          s.started_at,
          s.submitted_at,
          s.is_completed,
          s.is_published,
          s.teacher_feedback,
          COUNT(sa.id) as total_questions,
          SUM(CASE WHEN sa.evaluation_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
          SUM(CASE WHEN sa.evaluation_status = 'processing' THEN 1 ELSE 0 END) as processing_count,
          SUM(CASE WHEN sa.evaluation_status IN ('completed', 'not_required') THEN 1 ELSE 0 END) as completed_count,
          SUM(CASE WHEN sa.evaluation_status = 'failed' THEN 1 ELSE 0 END) as failed_count,
          e.title as exam_title,
          e.duration_minutes
        FROM submissions s
        LEFT JOIN exams e ON s.exam_id = e.id
        LEFT JOIN submission_answers sa ON s.id = sa.submission_id
        WHERE s.exam_id = $1
        GROUP BY s.id, e.title, e.duration_minutes
        ORDER BY s.submitted_at DESC
      `;

      const result = await pool.query(query, [id]);

      // Transform results for frontend
      const submissions = result.rows.map((sub) => {
        const total = parseInt(sub.total_questions) || 0;
        const pending = parseInt(sub.pending_count) || 0;
        const processing = parseInt(sub.processing_count) || 0;
        const completed = parseInt(sub.completed_count) || 0;
        const failed = parseInt(sub.failed_count) || 0;

        // Determine overall status
        let status = "pending";
        const totalPending = pending + processing + failed;

        if (totalPending === 0 && total > 0) {
          // All answers are processed (either completed or not_required like MCQs)
          status = "completed";
        } else if (processing > 0) {
          status = "processing";
        } else if (failed > 0) {
          status = "failed";
        } else if (pending > 0) {
          status = "pending";
        }

        return {
          id: sub.id,
          exam_id: sub.exam_id,
          student_name: sub.student_name,
          score: parseFloat(sub.score) || 0,
          started_at: sub.started_at,
          submitted_at: sub.submitted_at,
          is_completed: sub.is_completed,
          is_published: sub.is_published,
          teacher_feedback: sub.teacher_feedback,
          exam_title: sub.exam_title,
          duration_minutes: sub.duration_minutes,
          total_questions: total,
          pending_count: pending,
          processing_count: processing,
          completed_count: completed,
          failed_count: failed,
          status,
        };
      });

      return res.status(200).json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      console.error("Error fetching exam submissions:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch exam submissions",
        error: error.message,
      });
    }
  }

  /**
   * Get detailed submission with all answers
   */
  async getSubmissionDetails(req, res) {
    try {
      const { id } = req.params;

      // Get submission info
      const submissionQuery = `
        SELECT
          s.*,
          e.title as exam_title,
          e.description as exam_description,
          e.duration_minutes
        FROM submissions s
        LEFT JOIN exams e ON s.exam_id = e.id
        WHERE s.id = $1
      `;
      const submissionResult = await pool.query(submissionQuery, [id]);

      if (submissionResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }

      const submission = submissionResult.rows[0];

      // Get all answers with question details
      const answersQuery = `
        SELECT
          sa.id,
          sa.submission_id,
          sa.question_id,
          sa.selected_option,
          sa.answer_text,
          sa.is_correct,
          sa.marks_obtained,
          sa.ai_marks,
          sa.teacher_marks,
          sa.ai_feedback,
          sa.teacher_feedback,
          sa.evaluation_status,
          sa.evaluation_completed_at,
          sa.evaluation_requested_at,
          q.type,
          q.question_text,
          q.question_text_en,
          q.options,
          q.answer,
          q.answer_bn,
          q.marks as max_marks,
          q.difficulty,
          q.bloom_level
        FROM submission_answers sa
        JOIN questions q ON sa.question_id = q.id
        WHERE sa.submission_id = $1
        ORDER BY sa.id
      `;
      const answersResult = await pool.query(answersQuery, [id]);

      // Parse options and AI feedback for each answer
      const answers = answersResult.rows.map((ans) => {
        let parsedAiFeedback = null;
        if (ans.ai_feedback) {
          try {
            parsedAiFeedback =
              typeof ans.ai_feedback === "string"
                ? JSON.parse(ans.ai_feedback)
                : ans.ai_feedback;
          } catch (e) {
            console.error("Failed to parse AI feedback:", e);
            parsedAiFeedback = null;
          }
        }

        return {
          ...ans,
          options: ans.options ? JSON.parse(ans.options) : null,
          ai_feedback: parsedAiFeedback,
          marks_obtained: ans?.teacher_marks || ans?.ai_marks || 0,
        };
      });

      // Calculate scores
      const mcqScore = answers
        .filter((a) => a.type === "mcq")
        .reduce((sum, a) => sum + (parseFloat(a.marks_obtained) || 0), 0);

      const aiScore = answers
        .filter((a) => a.type !== "mcq")
        .reduce(
          (sum, a) =>
            sum + (parseFloat(a.teacher_marks) || parseFloat(a.ai_marks) || 0),
          0,
        );

      const totalScore = mcqScore + aiScore;
      const maxScore = answers.reduce(
        (sum, a) => sum + (parseFloat(a.max_marks) || 0),
        0,
      );

      return res.status(200).json({
        success: true,
        data: {
          submission: {
            ...submission,
            mcq_score: mcqScore,
            ai_score: aiScore,
            total_score: totalScore,
            max_score: maxScore,
          },
          answers,
        },
      });
    } catch (error) {
      console.error("Error fetching submission details:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch submission details",
        error: error.message,
      });
    }
  }

  /**
   * Update teacher grades and feedback
   */
  async updateGrades(req, res) {
    try {
      const { id } = req.params;
      const { teacher_feedback, answers } = req.body;

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          message: "answers array is required",
        });
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Update submission teacher feedback
        if (teacher_feedback !== undefined) {
          await client.query(
            "UPDATE submissions SET teacher_feedback = $1 WHERE id = $2",
            [teacher_feedback, id],
          );
        }

        // Update individual answer grades
        for (const ans of answers) {
          const {
            answer_id,
            teacher_marks,
            teacher_feedback: ans_feedback,
          } = ans;

          const updateFields = [];
          const updateValues = [];
          let paramCount = 1;

          if (teacher_marks !== undefined) {
            updateFields.push(`teacher_marks = $${paramCount}`);
            updateValues.push(teacher_marks);
            paramCount++;
          }

          if (ans_feedback !== undefined) {
            updateFields.push(`teacher_feedback = $${paramCount}`);
            updateValues.push(ans_feedback);
            paramCount++;
          }

          if (updateFields.length > 0) {
            updateValues.push(answer_id);
            await client.query(
              `UPDATE submission_answers
               SET ${updateFields.join(", ")}
               WHERE id = $${paramCount}`,
              updateValues,
            );
          }
        }

        // Recalculate total score
        const scoreQuery = `
          UPDATE submissions s
          SET score = (
            SELECT COALESCE(SUM(
              CASE
                WHEN sa.teacher_marks IS NOT NULL THEN sa.teacher_marks
                WHEN sa.ai_marks IS NOT NULL THEN sa.ai_marks
                ELSE sa.marks_obtained
              END
            ), 0)
            FROM submission_answers sa
            WHERE sa.submission_id = s.id
          )
          WHERE s.id = $1
          RETURNING score
        `;
        const scoreResult = await client.query(scoreQuery, [id]);

        await client.query("COMMIT");

        return res.status(200).json({
          success: true,
          message: "Grades updated successfully",
          data: {
            submission_id: id,
            new_score: parseFloat(scoreResult.rows[0].score),
          },
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error updating grades:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update grades",
        error: error.message,
      });
    }
  }

  /**
   * Publish or unpublish a submission
   */
  async publishSubmission(req, res) {
    try {
      const { id } = req.params;
      const { is_published } = req.body;

      if (typeof is_published !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "is_published (boolean) is required",
        });
      }

      const query = `
        UPDATE submissions
        SET is_published = $1
        WHERE id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [is_published, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: is_published
          ? "Submission published successfully"
          : "Submission unpublished",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error publishing submission:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to publish submission",
        error: error.message,
      });
    }
  }

  /**
   * Get submissions for a student or all submissions (for teachers)
   */
  async getStudentSubmissions(req, res) {
    try {
      const { student_name, status, is_published } = req.query;

      let query = `
        SELECT
          s.id,
          s.exam_id,
          s.student_name,
          s.score,
          s.started_at,
          s.submitted_at,
          s.is_completed,
          s.is_published,
          s.teacher_feedback,
          e.title as exam_title,
          e.duration_minutes,
          COUNT(sa.id) as total_questions,
          SUM(CASE WHEN sa.evaluation_status IN ('completed', 'not_required') THEN 1 ELSE 0 END) as completed_count,
          SUM(CASE WHEN sa.evaluation_status IN ('pending', 'processing') THEN 1 ELSE 0 END) as pending_count
        FROM submissions s
        LEFT JOIN exams e ON s.exam_id = e.id
        LEFT JOIN submission_answers sa ON s.id = sa.submission_id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      // Optional student filter
      if (student_name) {
        query += ` AND s.student_name = $${paramCount}`;
        params.push(student_name);
        paramCount++;
      }

      // Optional status filter
      if (status) {
        query += ` AND s.is_completed = $${paramCount}`;
        params.push(status === "completed");
        paramCount++;
      }

      // Optional published filter
      if (is_published !== undefined) {
        query += ` AND s.is_published = $${paramCount}`;
        params.push(is_published === "true");
        paramCount++;
      }

      query += `
        GROUP BY s.id, e.title, e.duration_minutes
        ORDER BY s.submitted_at DESC
      `;

      const result = await pool.query(query, params);

      // Transform results - hide sensitive data if not published
      const submissions = result.rows.map((sub) => {
        const isPublished = sub.is_published;

        return {
          id: sub.id,
          exam_id: sub.exam_id,
          exam_title: sub.exam_title,
          duration_minutes: sub.duration_minutes,
          student_name: sub.student_name,
          started_at: sub.started_at,
          submitted_at: sub.submitted_at,
          is_completed: sub.is_completed,
          is_published: sub.is_published,
          total_questions: parseInt(sub.total_questions) || 0,
          completed_count: parseInt(sub.completed_count) || 0,
          pending_count: parseInt(sub.pending_count) || 0,
          // Only show these if published
          score: isPublished ? parseFloat(sub.score) || 0 : null,
          teacher_feedback: isPublished ? sub.teacher_feedback : null,
        };
      });

      return res.status(200).json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      console.error("Error fetching student submissions:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch student submissions",
        error: error.message,
      });
    }
  }
}

module.exports = new GradingController();
