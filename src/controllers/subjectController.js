const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * List all subjects
 * GET /api/subjects
 */
async function listSubjects(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name FROM subjects ORDER BY name'
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error.message,
    });
  }
}

/**
 * List topics for a subject
 * GET /api/subjects/:id/topics
 */
async function listTopics(req, res) {
  try {
    const { id } = req.params;

    // Verify subject exists
    const subjectCheck = await pool.query(
      'SELECT id FROM subjects WHERE id = $1',
      [id]
    );

    if (subjectCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    const result = await pool.query(
      'SELECT id, name FROM topics WHERE subject_id = $1 ORDER BY name',
      [id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topics',
      error: error.message,
    });
  }
}

/**
 * List all subjects (RAG-compatible - returns array of strings)
 * GET /api/subjects
 */
async function listSubjectsNames(req, res) {
  try {
    // Query cached subjects table
    const result = await pool.query(
      'SELECT name, last_synced_at FROM cached_subjects WHERE is_active = true ORDER BY name'
    );

    // Extract just the subject names as strings
    const subjects = result.rows.map(row => row.name);

    res.json({
      success: true,
      data: subjects,
      count: subjects.length,
      source: 'cache',
      last_synced_at: result.rows.length > 0 ? result.rows[0].last_synced_at : null
    });
  } catch (error) {
    console.error('Error fetching cached subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error.message,
    });
  }
}

/**
 * List topics for a subject by name (RAG-compatible)
 * GET /api/subjects/:subject/topics
 */
async function listTopicsBySubjectName(req, res) {
  try {
    const { subject } = req.params;

    // Decode URL-encoded subject name (handles Bengali text, spaces, etc.)
    const decodedSubject = decodeURIComponent(subject);

    // Query cached topics table
    const result = await pool.query(
      `SELECT name, last_synced_at
       FROM cached_topics
       WHERE subject = $1 AND is_active = true
       ORDER BY name`,
      [decodedSubject]
    );

    // Extract just the topic names as strings
    const topics = result.rows.map(row => row.name);

    res.json({
      success: true,
      data: topics,
      count: topics.length,
      source: 'cache',
      last_synced_at: result.rows.length > 0 ? result.rows[0].last_synced_at : null
    });
  } catch (error) {
    console.error('Error fetching cached topics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topics',
      error: error.message,
    });
  }
}

/**
 * List subtopics for a subject and topic combination (RAG-compatible)
 * GET /api/subjects/:subject/topics/:topic/subtopics
 */
async function listSubtopicsByNames(req, res) {
  try {
    const { subject, topic } = req.params;

    // Decode URL-encoded names (handles Bengali text, spaces, etc.)
    const decodedSubject = decodeURIComponent(subject);
    const decodedTopic = decodeURIComponent(topic);

    // Query cached subtopics table
    const result = await pool.query(
      `SELECT name, last_synced_at
       FROM cached_subtopics
       WHERE subject = $1
         AND topic = $2
         AND is_active = true
       ORDER BY name`,
      [decodedSubject, decodedTopic]
    );

    // Extract just the subtopic names as strings
    const subtopics = result.rows.map(row => row.name);

    res.json({
      success: true,
      data: subtopics,
      count: subtopics.length,
      source: 'cache',
      last_synced_at: result.rows.length > 0 ? result.rows[0].last_synced_at : null
    });
  } catch (error) {
    console.error('Error fetching cached subtopics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subtopics',
      error: error.message,
    });
  }
}

module.exports = {
  listSubjects,
  listTopics,
  listSubjectsNames,
  listTopicsBySubjectName,
  listSubtopicsByNames,
};
