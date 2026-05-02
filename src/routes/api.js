const express = require("express");
const questionController = require("../controllers/questionController");
const examController = require("../controllers/examController");
const evaluationController = require("../controllers/evaluationController");
const performanceController = require("../controllers/performanceController");
const subjectController = require("../controllers/subjectController");
const submissionAnswerController = require("../controllers/submissionAnswerController");

const router = express.Router();

// Subject & Topic routes (Old format - for backward compatibility)
router.get("/subjects-old", (req, res) => subjectController.listSubjects(req, res));
router.get("/subjects-old/:id/topics", (req, res) => subjectController.listTopics(req, res));

// Subject & Topic routes (RAG-compatible - NEW)
// These endpoints match the RAG API structure exactly
router.get("/subjects", (req, res) => subjectController.listSubjectsNames(req, res));
router.get("/subjects/:subject/topics", (req, res) => subjectController.listTopicsBySubjectName(req, res));
router.get("/subjects/:subject/topics/:topic/subtopics", (req, res) => subjectController.listSubtopicsByNames(req, res));

// Question routes
router.get("/questions", (req, res) => questionController.getQuestions(req, res));
router.get("/questions/:id", (req, res) => questionController.getQuestionById(req, res));
router.put("/questions/:id", (req, res) => questionController.updateQuestion(req, res));
router.post("/questions/store-rag", (req, res) => questionController.storeQuestionsFromRAG(req, res));
router.post("/questions/stream", (req, res) => questionController.streamAndStoreQuestions(req, res));
router.post("/questions/publish", (req, res) => questionController.publishQuestions(req, res));

// Exam routes
router.get("/exams", (req, res) => examController.listExams(req, res));
router.get("/exams/:id", (req, res) => examController.getExam(req, res));
router.get("/exams/submissions/answers/:id", (req, res) => examController.getSubmissionAnswerById(req, res));
router.post("/exams", (req, res) => examController.createExam(req, res));
router.post("/exams/submit", (req, res) => examController.submitExam(req, res));

// Submission answer routes (for RAG API to fetch answer data)
router.post("/submission-answers/bulk", (req, res) => submissionAnswerController.bulkGetSubmissionAnswers(req, res));
router.get("/submission-answers/:id", (req, res) => submissionAnswerController.getSubmissionAnswerById(req, res));

// Evaluation routes (webhook endpoints for RAG service)
router.put("/submission-answers/:id/evaluation", (req, res) => evaluationController.receiveEvaluationResult(req, res));
router.get("/submission-answers/:id/evaluation-status", (req, res) => evaluationController.getEvaluationStatus(req, res));

// Performance analysis routes
router.post("/performance/analyze", (req, res) => performanceController.analyzePerformance(req, res));
router.put("/performance/reports/:id", (req, res) => performanceController.receivePerformanceReport(req, res));
router.get("/performance/reports/:id", (req, res) => performanceController.getPerformanceReport(req, res));
router.get("/performance/reports", (req, res) => performanceController.listPerformanceReports(req, res));
router.get("/performance/reports/:id/status", (req, res) => performanceController.getAnalysisStatus(req, res));

module.exports = router;
