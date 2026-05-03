const pool = require("../config/database");

class EvaluationController {
  /**
   * Webhook endpoint to receive AI evaluation results from RAG service
   */
  async receiveEvaluationResult(req, res) {
    try {
      const { id } = req.params;
      const { ai_marks, ai_feedback, evaluated_at } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "submission_answer_id is required",
        });
      }

      if (ai_marks === undefined || !ai_feedback) {
        return res.status(400).json({
          success: false,
          message: "ai_marks and ai_feedback are required",
        });
      }

      // Start a transaction
      const client = await pool.pool.connect();
      try {
        await client.query("BEGIN");

        // 1. Fetch the submission answer with question and submission details
        const fetchQuery = `
                    SELECT sa.id, sa.submission_id, sa.question_id, sa.evaluation_status,
                           q.marks as max_marks
                    FROM submission_answers sa
                    JOIN questions q ON sa.question_id = q.id
                    WHERE sa.id = $1
                `;
        const fetchResult = await client.query(fetchQuery, [id]);

        if (fetchResult.rows.length === 0) {
          await client.query("ROLLBACK");
          return res.status(404).json({
            success: false,
            message: "Submission answer not found",
          });
        }

        const submissionAnswer = fetchResult.rows[0];

        // 2. Update submission_answer with AI evaluation results
        const updateQuery = `
                    UPDATE submission_answers
                    SET ai_marks = $1,
                        marks_obtained = $1,
                        ai_feedback = $2,
                        evaluation_status = 'evaluated',
                        evaluation_completed_at = $3
                    WHERE id = $4
                `;
        await client.query(updateQuery, [
          ai_marks,
          JSON.stringify(ai_feedback),
          evaluated_at || new Date(),
          id,
        ]);

        // 3. Recalculate submission total score
        const scoreQuery = `
                    SELECT
                        COALESCE(SUM(CASE WHEN q.type = 'mcq' THEN sa.marks_obtained ELSE 0 END), 0) as mcq_score,
                        COALESCE(SUM(CASE WHEN sa.evaluation_status = 'evaluated' THEN sa.ai_marks ELSE 0 END), 0) as ai_score
                    FROM submission_answers sa
                    JOIN questions q ON sa.question_id = q.id
                    WHERE sa.submission_id = $1
                `;
        const scoreResult = await client.query(scoreQuery, [
          submissionAnswer.submission_id,
        ]);
        const { mcq_score, ai_score } = scoreResult.rows[0];
        const totalScore = parseFloat(mcq_score) + parseFloat(ai_score);

        // 4. Update submission total score
        await client.query("UPDATE submissions SET score = $1 WHERE id = $2", [
          totalScore,
          submissionAnswer.submission_id,
        ]);

        await client.query("COMMIT");

        console.log(
          `Updated evaluation for submission_answer_id ${id}: ai_marks=${ai_marks}, total_score=${totalScore}`,
        );

        return res.status(200).json({
          success: true,
          message: "Evaluation result received and processed successfully",
          data: {
            submission_answer_id: id,
            ai_marks: ai_marks,
            total_score: totalScore,
          },
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error receiving evaluation result:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to process evaluation result",
        error: error.message,
      });
    }
  }

  /**
   * Get evaluation status for a submission answer
   */
  async getEvaluationStatus(req, res) {
    try {
      const { id } = req.params;

      const query = `
                SELECT sa.id, sa.question_id, sa.evaluation_status,
                       sa.ai_marks, sa.evaluation_requested_at, sa.evaluation_completed_at,
                       q.type, q.marks
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

      return res.status(200).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error fetching evaluation status:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch evaluation status",
        error: error.message,
      });
    }
  }
}

module.exports = new EvaluationController();
