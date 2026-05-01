# Question API Documentation

This document describes the API endpoints for managing questions.

## Base URL
`http://localhost:3000/api`

---

## 1. Get Questions
Retrieves a list of questions with optional filtering.

*   **URL:** `/questions`
*   **Method:** `GET`
*   **Query Parameters:**
    *   `type` (string, optional): Filter by question type (e.g., 'mcq', 'short').
    *   `status` (string, optional): Filter by status (e.g., 'draft', 'published').
    *   `is_published` (boolean, optional): Filter by publication status ('true' or 'false').
    *   `subject_id` (integer, optional): Filter by subject ID.
    *   `topic_id` (integer, optional): Filter by topic ID.
    *   `difficulty` (string, optional): Filter by difficulty level.
    *   `limit` (integer, default: 50): Number of records to return.
    *   `offset` (integer, default: 0): Number of records to skip.

### Example Curl:
```bash
curl "http://localhost:3000/api/questions?type=mcq&is_published=true&limit=10"
```

---

## 1a. Get Question by ID
Retrieves details of a specific question.

*   **URL:** `/questions/:id`
*   **Method:** `GET`

### Example Curl:
```bash
curl http://localhost:3000/api/questions/1
```

---

## 2. Store Questions from RAG
Stores questions received from a RAG (Retrieval-Augmented Generation) API response.

*   **URL:** `/questions/store-rag`
*   **Method:** `POST`
*   **Request Body:**
    *   `success` (boolean): Indicates if the RAG API call was successful.
    *   `data` (array): An array of question objects.

### Example Curl:
```bash
curl -X POST http://localhost:3000/api/questions/store-rag \
-H "Content-Type: application/json" \
-d '{
  "success": true,
  "data": [
    {
      "question_text": "What is the capital of France?",
      "topic": "Geography",
      "type": "mcq",
      "options": ["Paris", "London", "Berlin", "Madrid"],
      "answer": "Paris",
      "difficulty": "easy"
    }
  ]
}'
```

---

## 3. Update a Question
Updates an existing question and persists it to PostgreSQL.

*   **URL:** `/questions/:id`
*   **Method:** `PUT`
*   **Request Body:**
    *   `question_text` (string, optional)
    *   `type` (string, optional)
    *   `difficulty` (string, optional)
    *   `marks` (integer, optional)
    *   `options` (array of strings or `null`, optional)
    *   `answer` (string, optional)
    *   `explanation` (string, optional)
    *   `topic` (string, optional)
    *   `subtopic` (string, optional)
    *   `hint` (string, optional)

### Example Curl:
```bash
curl -X PUT http://localhost:3000/api/questions/12 \
-H "Content-Type: application/json" \
-d '{
  "question_text": "What is the main pigment used in photosynthesis?",
  "type": "mcq",
  "difficulty": "easy",
  "marks": 1,
  "options": ["Chlorophyll", "Hemoglobin", "Keratin", "Insulin"],
  "answer": "Chlorophyll",
  "explanation": "Chlorophyll captures light energy in plant cells."
}'
```

---

## 4. Stream and Store Questions
Initiates a stream from the RAG API, forwards events to the client, and automatically stores the generated questions.

*   **URL:** `/questions/stream`
*   **Method:** `POST`
*   **Request Body:**
    *   `subject` (string): The subject of the questions.
    *   `topic` (string): The topic of the questions.
    *   `exam` (string): The exam context.
    *   `grade` (string): The grade level.
    *   `type` (string): The type of questions to generate.
    *   `difficulty` (string): Difficulty level.
    *   `count` (integer): Number of questions to generate.
    *   `language` (string): Language of the questions.
    *   `focusOnBoardStyle` (boolean): Whether to focus on board exam style.

### Example Curl:
```bash
curl -X POST http://localhost:3000/api/questions/stream \
-H "Content-Type: application/json" \
-d '{
  "subject": "Biology",
  "topic": "Photosynthesis",
  "exam": "HSC",
  "grade": "12",
  "type": "mcq",
  "difficulty": "medium",
  "count": 5,
  "language": "en",
  "focusOnBoardStyle": true
}'
```

---

## 5. Publish Questions
Bulk updates the status of questions to 'published'.

*   **URL:** `/questions/publish`
*   **Method:** `POST`
*   **Request Body:**
    *   `question_ids` (array of integers): List of IDs to publish.

### Example Curl:
```bash
curl -X POST http://localhost:3000/api/questions/publish \
-H "Content-Type: application/json" \
-d '{
  "question_ids": [1, 2, 3]
}'
```
