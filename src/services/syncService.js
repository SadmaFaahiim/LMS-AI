const axios = require("axios");
const { pool } = require("../config/database");

class SyncService {
  constructor() {
    this.ragApiUrl = process.env.RAG_API_URL;
    this.syncInProgress = false;
    this.lastSyncTime = null;
  }

  /**
   * Fetch all subjects from RAG API and sync to database
   */
  async syncSubjects() {
    try {
      console.log("[Sync] Starting subjects sync...");

      const response = await axios.get(
        `${this.ragApiUrl}/api/taxonomy/subjects`,
        {
          timeout: 30000, // 30 seconds timeout
        },
      );

      const subjects = response.data.data || response.data;

      if (!Array.isArray(subjects)) {
        throw new Error("Invalid response format from RAG API");
      }

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // Mark all existing subjects as inactive
        await client.query("UPDATE cached_subjects SET is_active = false");

        // Upsert subjects from RAG
        for (const subject of subjects) {
          await client.query(
            `
                        INSERT INTO cached_subjects (name, is_active, last_synced_at)
                        VALUES ($1, true, CURRENT_TIMESTAMP)
                        ON CONFLICT (name)
                        DO UPDATE SET
                            is_active = true,
                            last_synced_at = CURRENT_TIMESTAMP,
                            updated_at = CURRENT_TIMESTAMP
                    `,
            [subject],
          );
        }

        await client.query("COMMIT");

        console.log(`[Sync] Successfully synced ${subjects.length} subjects`);
        return { success: true, count: subjects.length };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("[Sync] Error syncing subjects:", error.message);
      throw error;
    }
  }

  /**
   * Fetch topics for a specific subject from RAG API
   */
  async syncTopicsForSubject(subject) {
    try {
      console.log(`[Sync] Starting topics sync for subject: ${subject}...`);

      const response = await axios.post(
        `${this.ragApiUrl}/api/subjects/topics`,
        { subject: subject, timeout: 30000 },
      );

      const topics = response.data.data || response.data;

      if (!Array.isArray(topics)) {
        throw new Error("Invalid response format from RAG API");
      }

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // Mark existing topics as inactive
        await client.query(
          "UPDATE cached_topics SET is_active = false WHERE subject = $1",
          [subject],
        );

        // Upsert topics from RAG
        for (const topic of topics) {
          await client.query(
            `
                        INSERT INTO cached_topics (name, subject, is_active, last_synced_at)
                        VALUES ($1, $2, true, CURRENT_TIMESTAMP)
                        ON CONFLICT (name, subject)
                        DO UPDATE SET
                            is_active = true,
                            last_synced_at = CURRENT_TIMESTAMP,
                            updated_at = CURRENT_TIMESTAMP
                    `,
            [topic, subject],
          );
        }

        await client.query("COMMIT");

        console.log(
          `[Sync] Successfully synced ${topics.length} topics for ${subject}`,
        );
        return { success: true, count: topics.length };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(
        `[Sync] Error syncing topics for ${subject}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Fetch subtopics for a specific subject/topic from RAG API
   */
  async syncSubtopicsForTopic(subject, topic) {
    try {
      console.log(`[Sync] Starting subtopics sync for ${subject}/${topic}...`);

      const response = await axios.post(
        `${this.ragApiUrl}/api/subjects/subtopics`,
        { subject: subject, topic: topic, timeout: 30000 },
      );

      const subtopics = response.data.data || response.data;

      if (!Array.isArray(subtopics)) {
        throw new Error("Invalid response format from RAG API");
      }

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // Mark existing subtopics as inactive
        await client.query(
          `UPDATE cached_subtopics SET is_active = false
                     WHERE subject = $1 AND topic = $2`,
          [subject, topic],
        );

        // Upsert subtopics from RAG
        for (const subtopic of subtopics) {
          await client.query(
            `
                        INSERT INTO cached_subtopics (name, subject, topic, is_active, last_synced_at)
                        VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP)
                        ON CONFLICT (name, subject, topic)
                        DO UPDATE SET
                            is_active = true,
                            last_synced_at = CURRENT_TIMESTAMP,
                            updated_at = CURRENT_TIMESTAMP
                    `,
            [subtopic, subject, topic],
          );
        }

        await client.query("COMMIT");

        console.log(
          `[Sync] Successfully synced ${subtopics.length} subtopics for ${subject}/${topic}`,
        );
        return { success: true, count: subtopics.length };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(
        `[Sync] Error syncing subtopics for ${subject}/${topic}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Master sync function - syncs all subjects, topics, and subtopics
   */
  async syncAll() {
    if (this.syncInProgress) {
      console.log("[Sync] Sync already in progress, skipping...");
      return { success: false, message: "Sync already in progress" };
    }

    this.syncInProgress = true;
    const startTime = Date.now();
    console.log(
      "[Sync] ==================== STARTING FULL SYNC ====================",
    );

    try {
      // Step 1: Sync all subjects
      await this.syncSubjects();

      // Step 2: Get all active subjects and sync their topics
      const subjectsQuery = await pool.query(
        "SELECT name FROM cached_subjects WHERE is_active = true ORDER BY name",
      );

      const subjects = subjectsQuery.rows;
      let totalTopicsSynced = 0;
      let totalSubtopicsSynced = 0;

      for (const subject of subjects) {
        try {
          // Sync topics for this subject
          await this.syncTopicsForSubject(subject.name);

          // Get topics for this subject
          const topicsResult = await pool.query(
            "SELECT name FROM cached_topics WHERE subject = $1 AND is_active = true ORDER BY name",
            [subject.name],
          );

          const topics = topicsResult.rows;
          totalTopicsSynced += topics.length;

          // Sync subtopics for each topic
          for (const topic of topics) {
            try {
              await this.syncSubtopicsForTopic(subject.name, topic.name);
              totalSubtopicsSynced++;
            } catch (error) {
              console.error(
                `[Sync] Failed to sync subtopics for ${subject.name}/${topic.name}:`,
                error.message,
              );
              // Continue with next topic
            }
          }
        } catch (error) {
          console.error(
            `[Sync] Failed to sync topics for ${subject.name}:`,
            error.message,
          );
          // Continue with next subject
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(
        `[Sync] ==================== SYNC COMPLETED IN ${duration}s ====================`,
      );
      console.log(
        `[Sync] Summary: ${subjects.length} subjects, ${totalTopicsSynced} topics, ${totalSubtopicsSynced} subtopics`,
      );

      this.lastSyncTime = new Date();

      return {
        success: true,
        duration: duration,
        subjects: subjects.length,
        topics: totalTopicsSynced,
        subtopics: totalSubtopicsSynced,
      };
    } catch (error) {
      console.error("[Sync] Full sync failed:", error.message);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Retry logic wrapper
   */
  async syncWithRetry(maxAttempts = null) {
    const attempts =
      maxAttempts || parseInt(process.env.SYNC_RETRY_ATTEMPTS || "3");
    const delay = parseInt(process.env.SYNC_RETRY_DELAY_MS || "5000");

    for (let i = 1; i <= attempts; i++) {
      try {
        const result = await this.syncAll();
        return result;
      } catch (error) {
        console.error(`[Sync] Attempt ${i}/${attempts} failed:`, error.message);

        if (i < attempts) {
          console.log(`[Sync] Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error("[Sync] All retry attempts exhausted");
          throw error;
        }
      }
    }
  }
}

module.exports = new SyncService();
