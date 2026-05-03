-- Fix missing DEFAULT value for performance_reports.id column
-- This ensures the id column auto-generates from the sequence on INSERT

ALTER TABLE ONLY public.performance_reports
ALTER COLUMN id SET DEFAULT nextval('public.performance_reports_id_seq'::regclass);
