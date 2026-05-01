const pool = require('../config/database');

class ExamController {
    /**
     * Create a new exam from selected questions
     */
    async createExam(req, res) {
        try {
            const { title, description, duration_minutes, question_ids } = req.body;

            if (!title || !duration_minutes || !question_ids || !Array.isArray(question_ids)) {
                return res.status(400).json({
                    success: false,
                    message: 'title, duration_minutes, and question_ids array are required'
                });
            }

            // Start a transaction
            const client = await pool.pool.connect();
            try {
                await client.query('BEGIN');

                // 1. Insert exam
                const examQuery = `
                    INSERT INTO exams (title, description, duration_minutes)
                    VALUES ($1, $2, $3)
                    RETURNING id
                `;
                const examResult = await client.query(examQuery, [title, description, duration_minutes]);
                const examId = examResult.rows[0].id;

                // 2. Link questions
                for (const questionId of question_ids) {
                    await client.query(
                        'INSERT INTO exam_questions (exam_id, question_id) VALUES ($1, $2)',
                        [examId, questionId]
                    );
                }

                await client.query('COMMIT');

                return res.status(201).json({
                    success: true,
                    message: 'Exam created successfully',
                    data: {
                        exam_id: examId,
                        title,
                        duration_minutes,
                        total_questions: question_ids.length
                    }
                });
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error creating exam:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create exam',
                error: error.message
            });
        }
    }

    /**
     * Get exam details with questions (for taking the exam)
     */
    async getExam(req, res) {
        try {
            const { id } = req.params;

            const examQuery = 'SELECT * FROM exams WHERE id = $1';
            const examResult = await pool.query(examQuery, [id]);

            if (examResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Exam not found'
                });
            }

            const questionsQuery = `
                SELECT q.id, q.question_text, q.type, q.options, q.marks, q.hint, q.has_figure, q.has_formula
                FROM questions q
                JOIN exam_questions eq ON q.id = eq.question_id
                WHERE eq.exam_id = $1
            `;
            const questionsResult = await pool.query(questionsQuery, [id]);

            // Parse options for each question
            const questions = questionsResult.rows.map(q => ({
                ...q,
                options: q.options ? JSON.parse(q.options) : null
            }));

            return res.status(200).json({
                success: true,
                data: {
                    ...examResult.rows[0],
                    questions
                }
            });
        } catch (error) {
            console.error('Error fetching exam:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch exam',
                error: error.message
            });
        }
    }

    /**
     * Submit exam answers
     */
    async submitExam(req, res) {
        try {
            const { exam_id, student_name, answers } = req.body;

            if (!exam_id || !answers || !Array.isArray(answers)) {
                return res.status(400).json({
                    success: false,
                    message: 'exam_id and answers array are required'
                });
            }

            // Start a transaction
            const client = await pool.pool.connect();
            try {
                await client.query('BEGIN');

                // 1. Create submission record
                const submissionQuery = `
                    INSERT INTO submissions (exam_id, student_name, submitted_at, is_completed)
                    VALUES ($1, $2, CURRENT_TIMESTAMP, TRUE)
                    RETURNING id
                `;
                const submissionResult = await client.query(submissionQuery, [exam_id, student_name]);
                const submissionId = submissionResult.rows[0].id;

                let totalScore = 0;
                const results = [];

                // 2. Process each answer and calculate score for MCQs
                for (const ans of answers) {
                    const { question_id, selected_option, answer_text } = ans;

                    // Fetch the correct answer from DB to validate
                    const qQuery = 'SELECT type, answer, marks FROM questions WHERE id = $1';
                    const qResult = await client.query(qQuery, [question_id]);
                    
                    if (qResult.rows.length === 0) continue;

                    const question = qResult.rows[0];
                    let isCorrect = null;
                    let marksObtained = 0;

                    // Auto-grade MCQs
                    if (question.type === 'mcq') {
                        isCorrect = (selected_option === question.answer);
                        marksObtained = isCorrect ? question.marks : 0;
                        totalScore += marksObtained;
                    }

                    // Insert into submission_answers
                    await client.query(
                        `INSERT INTO submission_answers 
                        (submission_id, question_id, selected_option, answer_text, is_correct, marks_obtained)
                        VALUES ($1, $2, $3, $4, $5, $6)`,
                        [submissionId, question_id, selected_option, answer_text, is_correct, marksObtained]
                    );

                    results.push({
                        question_id,
                        is_correct: isCorrect,
                        marks_obtained: marksObtained
                    });
                }

                // 3. Update total score in submission
                await client.query(
                    'UPDATE submissions SET score = $1 WHERE id = $2',
                    [totalScore, submissionId]
                );

                await client.query('COMMIT');

                return res.status(200).json({
                    success: true,
                    message: 'Exam submitted successfully',
                    data: {
                        submission_id: submissionId,
                        total_score: totalScore,
                        results
                    }
                });
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error submitting exam:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to submit exam',
                error: error.message
            });
        }
    }

    /**
     * Get a specific submission answer by ID
     */
    async getSubmissionAnswerById(req, res) {
        try {
            const { id } = req.params;
            const query = 'SELECT * FROM submission_answers WHERE id = $1';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Submission answer not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error fetching submission answer:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch submission answer',
                error: error.message
            });
        }
    }

    /**
     * List all exams
     */
    async listExams(req, res) {
        try {
            const query = 'SELECT * FROM exams ORDER BY created_at DESC';
            const result = await pool.query(query);
            return res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Error listing exams:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to list exams',
                error: error.message
            });
        }
    }
}

module.exports = new ExamController();
