const express = require("express");
const questionController = require("../controllers/questionController");
const examController = require("../controllers/examController");

const router = express.Router();

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

module.exports = router;
