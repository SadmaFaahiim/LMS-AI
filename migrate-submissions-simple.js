require('dotenv').config({ override: true });
const { pool } = require('./src/config/database');

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('Starting migration for submission grading fields...\n');

    // Start transaction
    await client.query('BEGIN');

    // 1. Add columns to submissions table
    console.log('Adding columns to submissions table...');

    try {
      await client.query(`
        ALTER TABLE submissions
        ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE
      `);
      console.log('✓ Added is_published to submissions');
    } catch (err) {
      console.log('  - is_published already exists or error:', err.message);
    }

    try {
      await client.query(`
        ALTER TABLE submissions
        ADD COLUMN IF NOT EXISTS teacher_feedback TEXT
      `);
      console.log('✓ Added teacher_feedback to submissions');
    } catch (err) {
      console.log('  - teacher_feedback already exists or error:', err.message);
    }

    // 2. Add columns to submission_answers table
    console.log('\nAdding columns to submission_answers table...');

    try {
      await client.query(`
        ALTER TABLE submission_answers
        ADD COLUMN IF NOT EXISTS teacher_marks NUMERIC(5,2)
      `);
      console.log('✓ Added teacher_marks to submission_answers');
    } catch (err) {
      console.log('  - teacher_marks already exists or error:', err.message);
    }

    try {
      await client.query(`
        ALTER TABLE submission_answers
        ADD COLUMN IF NOT EXISTS teacher_feedback TEXT
      `);
      console.log('✓ Added teacher_feedback to submission_answers');
    } catch (err) {
      console.log('  - teacher_feedback already exists or error:', err.message);
    }

    // 3. Update existing records (set defaults)
    console.log('\nUpdating existing records...');

    const result = await client.query(`
      UPDATE submissions
      SET is_published = FALSE
      WHERE is_published IS NULL
    `);
    console.log(`✓ Updated ${result.rowCount} submissions with default is_published=FALSE`);

    // 4. Verify changes
    console.log('\nVerifying changes...');

    const columns = await client.query(`
      SELECT
        table_name,
        column_name,
        data_type,
        column_default
      FROM information_schema.columns
      WHERE table_name IN ('submissions', 'submission_answers')
      AND column_name IN ('is_published', 'teacher_feedback', 'teacher_marks')
      ORDER BY table_name, column_name
    `);

    console.log('\nCurrent schema:');
    console.table(columns.rows);

    // Commit transaction
    await client.query('COMMIT');
    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

// Run migration
migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
