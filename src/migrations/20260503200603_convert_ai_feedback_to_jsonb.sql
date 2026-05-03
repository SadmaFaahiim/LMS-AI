-- Migration: Convert ai_feedback from TEXT to JSONB
-- Date: 2026-05-03
-- Description: Safely convert ai_feedback column in submission_answers table from TEXT to JSONB type
--              This enables JSON querying, indexing, and automatic parsing by the PostgreSQL driver

-- Start transaction for atomic operation
BEGIN;

-- Step 1: Validate existing data (optional but recommended)
-- This will show us if there's any invalid JSON before we proceed
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM submission_answers
    WHERE ai_feedback IS NOT NULL
      AND ai_feedback::text <> ''
      AND ai_feedback::jsonb IS NULL;

    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Found % records with invalid JSON in ai_feedback. Please fix before migrating.', invalid_count;
    END IF;

    RAISE NOTICE 'All ai_feedback values are valid JSON or NULL. Safe to proceed.';
END $$;

-- Step 2: Create a backup of the column (safety measure)
ALTER TABLE submission_answers ADD COLUMN IF NOT EXISTS ai_feedback_backup TEXT;

UPDATE submission_answers SET ai_feedback_backup = ai_feedback WHERE ai_feedback IS NOT NULL;

-- Step 3: Convert the column type using USING clause
-- The USING clause ensures proper conversion from text to jsonb
-- NULL values are preserved automatically
ALTER TABLE submission_answers
    ALTER COLUMN ai_feedback
    TYPE jsonb
    USING ai_feedback::jsonb;

-- Step 4: Add a GIN index for JSONB queries (optional but recommended for performance)
-- This enables efficient JSON queries like: WHERE ai_feedback @> '{"feedback_en": "some text"}'
CREATE INDEX IF NOT EXISTS idx_submission_answers_ai_feedback_gin
    ON submission_answers
    USING GIN (ai_feedback);

-- Step 5: Verify the migration
SELECT
    COUNT(*) as total_records,
    COUNT(ai_feedback) as records_with_feedback,
    COUNT(ai_feedback_backup) as backup_records
FROM submission_answers;

-- Step 6: Add comment for documentation
COMMENT ON COLUMN submission_answers.ai_feedback IS 'AI-generated feedback in JSONB format with fields: feedback_en, feedback_bn, strengths, areas_for_improvement, suggested_answer';

COMMIT;

-- Rollback plan (if needed, run this in a separate transaction):
-- BEGIN;
-- ALTER TABLE submission_answers ALTER COLUMN ai_feedback TYPE TEXT USING ai_feedback::TEXT;
-- DROP INDEX IF EXISTS idx_submission_answers_ai_feedback_gin;
-- ALTER TABLE submission_answers DROP COLUMN IF EXISTS ai_feedback_backup;
-- COMMIT;
