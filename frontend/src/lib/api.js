import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API methods
export const api = {
  // Questions
  getQuestions: (params) => apiClient.get('/questions', { params }),
  getQuestion: (id) => apiClient.get(`/questions/${id}`),
  updateQuestion: (id, data) => apiClient.put(`/questions/${id}`, data),
  streamQuestions: (data) => fetch(`${API_BASE}/questions/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  publishQuestions: (ids) => apiClient.post('/questions/publish', { question_ids: ids }),
  storeQuestionsFromRAG: (data) => apiClient.post('/questions/store-rag', {
    success: true,
    data: data // Array of questions
  }),

  // Subjects & Topics (string-based, RAG-compatible)
  getSubjects: () => apiClient.get('/subjects'),
  getTopics: (subject) => apiClient.get(`/subjects/${subject}/topics`),
  getSubtopics: (subject, topic) => apiClient.get(`/subjects/${subject}/topics/${topic}/subtopics`),

  // Exams
  getExams: () => apiClient.get('/exams'),
  getExam: (id) => apiClient.get(`/exams/${id}`),
  createExam: (data) => apiClient.post('/exams', data),
  submitExam: (data) => apiClient.post('/exams/submit', data),
  getExamSubmissions: (id) => apiClient.get(`/exams/${id}/submissions`),

  // Submissions & Grading
  getSubmissionDetails: (id) => apiClient.get(`/submissions/${id}`),
  updateSubmissionGrades: (id, data) => apiClient.put(`/submissions/${id}/grades`, data),
  publishSubmission: (id, isPublished) => apiClient.put(`/submissions/${id}/publish`, { is_published: isPublished }),
  getSubmissions: (params) => apiClient.get('/submissions', { params }),
  getSubmissionAnswer: (id) => apiClient.get(`/exams/submissions/answers/${id}`),

  // Evaluation
  getEvaluationStatus: (id) => apiClient.get(`/submission-answers/${id}/evaluation-status`),

  // Performance
  analyzePerformance: (data) => apiClient.post('/performance/analyze', data),
  getPerformanceReport: (id) => apiClient.get(`/performance/reports/${id}`),
  listPerformanceReports: (params) => apiClient.get('/performance/reports', { params }),
  getAnalysisStatus: (id) => apiClient.get(`/performance/reports/${id}/status`),
};

export default apiClient;
