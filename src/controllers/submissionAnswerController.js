const pool = require("../config/database");

class SubmissionAnswerController {
  /**
   * Bulk fetch submission answers by IDs
   * POST /api/submission-answers/bulk
   *
   * Allows RAG API to fetch multiple submission answers in a single request
   * instead of calling the individual endpoint multiple times.
   */
  async bulkGetSubmissionAnswers(req, res) {
    try {
      const { ids } = req.body;

      // Validate input
      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({
          success: false,
          message: "ids array is required",
        });
      }

      if (ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "ids array cannot be empty",
        });
      }

      // Limit the number of IDs to prevent excessive queries
      if (ids.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Cannot fetch more than 100 submission answers at once",
        });
      }

      // Query all submission answers with their question details
      const query = `
                SELECT
                    sa.id,
                    sa.submission_id,
                    sa.question_id,
                    sa.selected_option,
                    sa.answer_text,
                    sa.is_correct,
                    sa.marks_obtained,
                    sa.ai_marks,
                    sa.ai_feedback,
                    sa.evaluation_status,
                    sa.evaluation_requested_at,
                    sa.evaluation_completed_at,
                    q.id as question_id,
                    q.type as question_type,
                    q.question_text,
                    q.question_text_en,
                    q.subject,
                    q.topic,
                    q.subtopic,
                    q.difficulty,
                    q.marks as max_marks,
                    q.need_evaluation
                FROM submission_answers sa
                JOIN questions q ON sa.question_id = q.id
                WHERE sa.id = ANY($1::int[])
                ORDER BY sa.id
            `;

      const result = await pool.query(query, [ids]);

      // Parse ai_feedback JSON if present
      const answers = result.rows.map((row) => ({
        id: row.id,
        submission_id: row.submission_id,
        question_id: row.question_id,
        selected_option: row.selected_option,
        answer_text: row.answer_text,
        is_correct: row.is_correct,
        marks_obtained: row.marks_obtained,
        ai_marks: row.ai_marks,
        ai_feedback: row.ai_feedback
          ? (typeof row.ai_feedback === 'string' ? JSON.parse(row.ai_feedback) : row.ai_feedback)
          : null,
        evaluation_status: row.evaluation_status,
        evaluation_requested_at: row.evaluation_requested_at,
        evaluation_completed_at: row.evaluation_completed_at,
        question: {
          id: row.question_id,
          type: row.question_type,
          question_text: row.question_text,
          question_text_en: row.question_text_en,
          subject: row.subject,
          topic: row.topic,
          subtopic: row.subtopic,
          difficulty: row.difficulty,
          marks: row.max_marks,
          need_evaluation: row.need_evaluation,
        },
      }));

      return res.status(200).json({
        success: true,
        data: answers,
        count: answers.length,
      });
    } catch (error) {
      console.error("Error bulk fetching submission answers:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch submission answers",
        error: error.message,
      });
    }
  }

  /**
   * Get a single submission answer by ID
   * (Existing method, kept for backward compatibility)
   */
  async getSubmissionAnswerById(req, res) {
    try {
      const { id } = req.params;

      const query = `
                SELECT
                    sa.id,
                    sa.submission_id,
                    sa.question_id,
                    sa.selected_option,
                    sa.answer_text,
                    sa.is_correct,
                    sa.marks_obtained,
                    sa.ai_marks,
                    sa.ai_feedback,
                    sa.evaluation_status,
                    sa.evaluation_requested_at,
                    sa.evaluation_completed_at,
                    q.type as question_type,
                    q.question_text,
                    q.subject,
                    q.topic,
                    q.marks as max_marks
                FROM submission_answers sa
                JOIN questions q ON sa.question_id = q.id
                WHERE sa.id = $1
            `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Submission answer not found",
        });
      }

      console.log("result", result.rows[0]);

      const row = result.rows[0];
      const answer = {
        id: row.id,
        submission_id: row.submission_id,
        question_id: row.question_id,
        selected_option: row.selected_option,
        answer_text: row.answer_text,
        is_correct: row.is_correct,
        marks_obtained: row.marks_obtained,
        ai_marks: row.ai_marks,
        ai_feedback: row.ai_feedback
          ? (typeof row.ai_feedback === 'string' ? JSON.parse(row.ai_feedback) : row.ai_feedback)
          : null,
        evaluation_status: row.evaluation_status,
        evaluation_requested_at: row.evaluation_requested_at,
        evaluation_completed_at: row.evaluation_completed_at,
        question: {
          id: row.question_id,
          type: row.question_type,
          question_text: row.question_text,
          subject: row.subject,
          topic: row.topic,
          marks: row.max_marks,
        },
      };

      return res.status(200).json({
        success: true,
        data: answer,
      });
    } catch (error) {
      console.error("Error fetching submission answer:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch submission answer",
        error: error.message,
      });
    }
  }
}

module.exports = new SubmissionAnswerController();
