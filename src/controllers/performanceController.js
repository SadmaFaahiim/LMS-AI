const pool = require('../config/database');
const axios = require('axios');

class PerformanceController {
    /**
     * Trigger performance analysis for a student
     * Filters submission answers by date range and sends to RAG for analysis
     */
    async analyzePerformance(req, res) {
        try {
            const { student_name, start_date, end_date } = req.body;

            if (!student_name || !start_date || !end_date) {
                return res.status(400).json({
                    success: false,
                    message: 'student_name, start_date, and end_date are required'
                });
            }

            // Validate dates
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);

            if (isNaN(startDate) || isNaN(endDate)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format. Use YYYY-MM-DD format'
                });
            }

            if (startDate > endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'start_date must be before end_date'
                });
            }

            // Fetch submission answers within date range that have been evaluated
            const query = `
                SELECT sa.id, sa.submission_id, sa.question_id, sa.answer_text,
                       sa.ai_marks, sa.marks_obtained, sa.evaluation_status,
                       sa.evaluation_completed_at,
                       q.type, q.marks as max_marks, q.question_text,
                       q.subject_id, q.topic_id, q.difficulty,
                       s.name as subject_name, t.name as topic_name,
                       sub.submitted_at
                FROM submission_answers sa
                JOIN submissions sub ON sa.submission_id = sub.id
                JOIN questions q ON sa.question_id = q.id
                LEFT JOIN subjects s ON q.subject_id = s.id
                LEFT JOIN topics t ON q.topic_id = t.id
                WHERE sub.student_name = $1
                  AND sub.submitted_at >= $2
                  AND sub.submitted_at <= $3
                  AND sa.evaluation_status = 'evaluated'
                  AND (sa.ai_marks > 0 OR sa.marks_obtained > 0)
                ORDER BY sub.submitted_at DESC, sa.id
            `;

            const result = await pool.query(query, [student_name, startDate, endDate]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No evaluated submission answers found for the given criteria'
                });
            }

            // Calculate preliminary statistics
            const evaluatedAnswers = result.rows;
            const submissionAnswerIds = evaluatedAnswers.map(a => a.id);

            let totalMCQScore = 0;
            let totalAIScore = 0;

            evaluatedAnswers.forEach(answer => {
                if (answer.type === 'mcq') {
                    totalMCQScore += parseFloat(answer.marks_obtained || 0);
                } else {
                    totalAIScore += parseFloat(answer.ai_marks || 0);
                }
            });

            // Create performance report record
            const insertQuery = `
                INSERT INTO performance_reports
                (student_name, start_date, end_date, total_answers_evaluated,
                 total_mcq_score, total_ai_score, report_status, analysis_requested_at)
                VALUES ($1, $2, $3, $4, $5, $6, 'pending', CURRENT_TIMESTAMP)
                RETURNING id
            `;

            const insertResult = await pool.query(insertQuery, [
                student_name,
                startDate,
                endDate,
                evaluatedAnswers.length,
                totalMCQScore,
                totalAIScore
            ]);

            const reportId = insertResult.rows[0].id;

            // Trigger RAG performance analysis (async, non-blocking)
            this.triggerRAGPerformanceAnalysis(reportId, submissionAnswerIds, student_name)
                .catch(error => {
                    console.error(`Error triggering RAG performance analysis for report ${reportId}:`, error);
                });

            return res.status(200).json({
                success: true,
                message: 'Performance analysis triggered successfully',
                data: {
                    report_id: reportId,
                    student_name: student_name,
                    date_range: {
                        start: start_date,
                        end: end_date
                    },
                    total_answers_evaluated: evaluatedAnswers.length,
                    preliminary_stats: {
                        total_mcq_score: totalMCQScore,
                        total_ai_score: totalAIScore,
                        overall_score: totalMCQScore + totalAIScore
                    },
                    report_status: 'pending'
                }
            });
        } catch (error) {
            console.error('Error analyzing performance:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to analyze performance',
                error: error.message
            });
        }
    }

    /**
     * Trigger RAG performance analysis
     * Sends submission answer IDs to RAG for comprehensive analysis
     */
    async triggerRAGPerformanceAnalysis(reportId, submissionAnswerIds, studentName) {
        const ragApiUrl = process.env.RAG_API_URL;

        if (!ragApiUrl) {
            console.error('RAG_API_URL not configured');
            return;
        }

        try {
            await axios.post(`${ragApiUrl}/api/performance/analyze`, {
                report_id: reportId,
                student_name: studentName,
                submission_answer_ids: submissionAnswerIds
            });
            console.log(`Triggered performance analysis for report_id: ${reportId} with ${submissionAnswerIds.length} answers`);
        } catch (error) {
            console.error(`Failed to trigger performance analysis for report_id ${reportId}:`, error.message);
            // Mark report as failed
            await pool.query(
                'UPDATE performance_reports SET report_status = $1 WHERE id = $2',
                ['failed', reportId]
            ).catch(err => console.error('Error updating report status:', err));
        }
    }

    /**
     * Webhook endpoint to receive performance analysis results from RAG
     */
    async receivePerformanceReport(req, res) {
        try {
            const { id } = req.params;
            const {
                overall_performance_rating,
                ai_feedback,
                study_plan,
                weakness_analysis,
                strength_analysis,
                recommended_topics,
                analyzed_at
            } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'report_id is required'
                });
            }

            // Check if report exists
            const checkQuery = 'SELECT id FROM performance_reports WHERE id = $1';
            const checkResult = await pool.query(checkQuery, [id]);

            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Performance report not found'
                });
            }

            // Update performance report with RAG results
            const updateQuery = `
                UPDATE performance_reports
                SET overall_performance_rating = $1,
                    ai_feedback = $2,
                    study_plan = $3,
                    weakness_analysis = $4,
                    strength_analysis = $5,
                    recommended_topics = $6,
                    report_status = 'completed',
                    analysis_completed_at = $7
                WHERE id = $8
                RETURNING *
            `;

            const values = [
                overall_performance_rating || null,
                ai_feedback ? JSON.stringify(ai_feedback) : null,
                study_plan ? JSON.stringify(study_plan) : null,
                weakness_analysis ? JSON.stringify(weakness_analysis) : null,
                strength_analysis ? JSON.stringify(strength_analysis) : null,
                recommended_topics ? JSON.stringify(recommended_topics) : null,
                analyzed_at || new Date(),
                id
            ];

            const result = await pool.query(updateQuery, values);

            console.log(`Performance report ${id} updated with RAG analysis results`);

            return res.status(200).json({
                success: true,
                message: 'Performance report received and stored successfully',
                data: {
                    report_id: id,
                    report_status: 'completed'
                }
            });
        } catch (error) {
            console.error('Error receiving performance report:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to process performance report',
                error: error.message
            });
        }
    }

    /**
     * Get a specific performance report by ID
     */
    async getPerformanceReport(req, res) {
        try {
            const { id } = req.params;

            const query = 'SELECT * FROM performance_reports WHERE id = $1';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Performance report not found'
                });
            }

            const report = result.rows[0];

            // Parse JSONB fields
            if (report.ai_feedback && typeof report.ai_feedback === 'string') {
                report.ai_feedback = JSON.parse(report.ai_feedback);
            }
            if (report.study_plan && typeof report.study_plan === 'string') {
                report.study_plan = JSON.parse(report.study_plan);
            }
            if (report.weakness_analysis && typeof report.weakness_analysis === 'string') {
                report.weakness_analysis = JSON.parse(report.weakness_analysis);
            }
            if (report.strength_analysis && typeof report.strength_analysis === 'string') {
                report.strength_analysis = JSON.parse(report.strength_analysis);
            }
            if (report.recommended_topics && typeof report.recommended_topics === 'string') {
                report.recommended_topics = JSON.parse(report.recommended_topics);
            }

            return res.status(200).json({
                success: true,
                data: report
            });
        } catch (error) {
            console.error('Error fetching performance report:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch performance report',
                error: error.message
            });
        }
    }

    /**
     * List performance reports for a student
     */
    async listPerformanceReports(req, res) {
        try {
            const { student_name, limit = 20, offset = 0 } = req.query;

            let query = 'SELECT * FROM performance_reports WHERE 1=1';
            const values = [];
            let paramIndex = 1;

            if (student_name) {
                query += ` AND student_name = $${paramIndex++}`;
                values.push(student_name);
            }

            query += ` ORDER BY analysis_requested_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
            values.push(parseInt(limit), parseInt(offset));

            const result = await pool.query(query, values);

            // Parse JSONB fields for each report
            const reports = result.rows.map(report => {
                const parsed = { ...report };
                if (parsed.ai_feedback && typeof parsed.ai_feedback === 'string') {
                    parsed.ai_feedback = JSON.parse(parsed.ai_feedback);
                }
                if (parsed.study_plan && typeof parsed.study_plan === 'string') {
                    parsed.study_plan = JSON.parse(parsed.study_plan);
                }
                if (parsed.weakness_analysis && typeof parsed.weakness_analysis === 'string') {
                    parsed.weakness_analysis = JSON.parse(parsed.weakness_analysis);
                }
                if (parsed.strength_analysis && typeof parsed.strength_analysis === 'string') {
                    parsed.strength_analysis = JSON.parse(parsed.strength_analysis);
                }
                if (parsed.recommended_topics && typeof parsed.recommended_topics === 'string') {
                    parsed.recommended_topics = JSON.parse(parsed.recommended_topics);
                }
                return parsed;
            });

            return res.status(200).json({
                success: true,
                data: reports,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    count: reports.length
                }
            });
        } catch (error) {
            console.error('Error listing performance reports:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to list performance reports',
                error: error.message
            });
        }
    }

    /**
     * Get performance analysis status
     */
    async getAnalysisStatus(req, res) {
        try {
            const { id } = req.params;

            const query = `
                SELECT id, student_name, start_date, end_date, total_answers_evaluated,
                       total_mcq_score, total_ai_score, overall_performance_rating,
                       report_status, analysis_requested_at, analysis_completed_at
                FROM performance_reports
                WHERE id = $1
            `;
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Performance report not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error fetching analysis status:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch analysis status',
                error: error.message
            });
        }
    }
}

module.exports = new PerformanceController();
