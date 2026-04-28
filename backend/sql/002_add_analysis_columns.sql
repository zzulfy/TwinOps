-- 002_add_analysis_columns.sql
-- Add missing columns to analysis_reports table if they do not exist.
-- IMPORTANT: BACKUP your table before applying.
-- Usage:
--   mysql -h <host> -P <port> -u <user> -p <database> < 002_add_analysis_columns.sql

-- Disable foreign key checks for the migration step (optional)
SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE analysis_reports
  ADD COLUMN IF NOT EXISTS engine VARCHAR(32) NULL,
  ADD COLUMN IF NOT EXISTS rca_status VARCHAR(32) NULL,
  ADD COLUMN IF NOT EXISTS root_causes_json JSON NULL,
  ADD COLUMN IF NOT EXISTS causal_graph_json JSON NULL,
  ADD COLUMN IF NOT EXISTS model_version VARCHAR(128) NULL,
  ADD COLUMN IF NOT EXISTS evidence_window_start DATETIME NULL,
  ADD COLUMN IF NOT EXISTS evidence_window_end DATETIME NULL;

SET FOREIGN_KEY_CHECKS=1;

-- Verification:
-- SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS
--   WHERE TABLE_SCHEMA='twinops' AND TABLE_NAME='analysis_reports' AND COLUMN_NAME IN (
--     'engine','rca_status','root_causes_json','causal_graph_json','model_version',
--     'evidence_window_start','evidence_window_end'
--   );
