# Exam & Submission API Documentation

This document describes the API endpoints for managing exams and processing student submissions.

## Base URL
`http://localhost:3000/api`

---

## 1. List All Exams
Retrieves a list of all available exams.

*   **URL:** `/exams`
*   **Method:** `GET`

### Example Curl:
```bash
curl http://localhost:3000/api/exams
```

---

## 2. Create New Exam
Creates an exam using existing question IDs.

*   **URL:** `/exams`
*   **Method:** `POST`
*   **Request Body:**
    *   `title` (string): Title of the exam.
    *   `description` (string, optional): Detailed description.
    *   `duration_minutes` (integer): The countdown timer limit in minutes.
    *   `question_ids` (array of integers): IDs of the questions to include.

### Example Curl:
```bash
curl -X POST http://localhost:3000/api/exams \
-H "Content-Type: application/json" \
-d '{
  "title": "Midterm Exam 2026",
  "description": "Comprehensive midterm for Biology.",
  "duration_minutes": 60,
  "question_ids": [1, 5, 12, 18]
}'
```

---

## 3. Get Exam Details
Retrieves details of a specific exam, including its questions (for the exam-taking view).

*   **URL:** `/exams/:id`
*   **Method:** `GET`

### Example Curl:
```bash
curl http://localhost:3000/api/exams/1
```

### Note for Frontend:
The response includes `duration_minutes`. Use this to initialize your countdown timer.

---

## 3a. Get Submission Answer Details
Retrieves details of a specific answer within a submission.

*   **URL:** `/exams/submissions/answers/:id`
*   **Method:** `GET`

### Example Curl:
```bash
curl http://localhost:3000/api/exams/submissions/answers/1
```

---

## 4. Submit Exam
Submits student answers for an exam. MCQs are automatically graded.

*   **URL:** `/exams/submit`
*   **Method:** `POST`
*   **Request Body:**
    *   `exam_id` (integer): ID of the exam.
    *   `student_name` (string): Name of the student.
    *   `answers` (array): List of answers.
        *   `question_id` (integer): ID of the question.
        *   `question_type` (string): Question type (e.g., `mcq`, `short`, `broad`, `creative`).
        *   `selected_option` (string, for MCQs): The option chosen by the student.
        *   `answer_text` (string, for short/broad): The written answer.

### Example Curl:
```bash
curl -X POST http://localhost:3000/api/exams/submit \
-H "Content-Type: application/json" \
-d '{
  "exam_id": 1,
  "student_name": "John Doe",
  "answers": [
    {
      "question_id": 1,
      "question_type": "mcq",
      "selected_option": "Paris"
    },
    {
      "question_id": 5,
      "question_type": "short",
      "answer_text": "Photosynthesis is the process by which plants make food."
    }
  ]
}'
```
