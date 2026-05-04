-- Add missing columns to submissions table for grading and publishing functionality
-- These columns are required by the grading controller for:
-- - Publishing/unpublishing submissions
-- - Teacher feedback functionality

ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS teacher_feedback TEXT;

-- Add columns to submission_answers table for teacher grading
ALTER TABLE public.submission_answers
ADD COLUMN IF NOT EXISTS teacher_marks numeric(5,2),
ADD COLUMN IF NOT EXISTS teacher_feedback TEXT;

-- Update existing records to set default values
UPDATE public.submissions SET is_published = false WHERE is_published IS NULL;
