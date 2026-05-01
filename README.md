# LMS Test - Question Management API

This project provides a robust API for managing educational questions, including integration with RAG (Retrieval-Augmented Generation) services for automated question generation.

## Project Transition Note
The project has been updated to focus on **Question Management**. The previous Prisma-based User Controller has been removed in favor of a raw SQL-based Question Controller to support specialized database operations and streaming.

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Database**:
   - Ensure you have a PostgreSQL database running.
   - Update `DATABASE_URL` in the `.env` file.
   - **Note**: This project currently uses a custom `pg` pool in `src/config/database.js` for raw SQL queries. Ensure your database contains the required tables (`questions`, `subjects`, `topics`).

3. **Environment Variables**:
   Add the following to your `.env` if using the streaming feature:
   ```env
   RAG_API_URL=your_rag_api_endpoint
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3000`.

## API Documentation

Detailed API documentation with example `curl` commands can be found in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Quick Summary of Endpoints:

- `GET /api/questions` - List and filter questions.
- `POST /api/questions/store-rag` - Store a batch of questions from a RAG service.
- `PUT /api/questions/:id` - Update a stored question.
- `POST /api/questions/stream` - Stream and store questions in real-time.
- `POST /api/questions/publish` - Bulk publish questions.

## Frontend

A Vite + React frontend is available in [`frontend`](./frontend) for:

- streaming question generation from the RAG endpoint
- listing stored questions
- editing a stored question and saving it back through the API

Run it with:

```bash
npm --prefix frontend install
npm run dev
npm run client:dev
```

## Troubleshooting

- Verify `DATABASE_URL` connectivity.
- Ensure the `pg` library is installed (`npm install pg`).
- Check that the `questions` table schema matches the fields used in `src/controllers/questionController.js`.
