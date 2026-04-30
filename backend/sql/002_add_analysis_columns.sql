-- 002_add_analysis_columns.sql
-- Idempotent migration for analysis_reports RCA/evidence columns.
-- Uses information_schema checks instead of ADD COLUMN IF NOT EXISTS so it works
-- with the MySQL 8.x images used by Docker deployment.

DELIMITER $$
DROP PROCEDURE IF EXISTS add_missing_analysis_columns$$
CREATE PROCEDURE add_missing_analysis_columns()
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='analysis_reports' AND COLUMN_NAME='engine') THEN
    ALTER TABLE analysis_reports ADD COLUMN engine VARCHAR(32) NULL;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='analysis_reports' AND COLUMN_NAME='rca_status') THEN
    ALTER TABLE analysis_reports ADD COLUMN rca_status VARCHAR(32) NULL;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='analysis_reports' AND COLUMN_NAME='root_causes_json') THEN
    ALTER TABLE analysis_reports ADD COLUMN root_causes_json JSON NULL;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='analysis_reports' AND COLUMN_NAME='causal_graph_json') THEN
    ALTER TABLE analysis_reports ADD COLUMN causal_graph_json JSON NULL;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='analysis_reports' AND COLUMN_NAME='model_version') THEN
    ALTER TABLE analysis_reports ADD COLUMN model_version VARCHAR(128) NULL;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='analysis_reports' AND COLUMN_NAME='evidence_window_start') THEN
    ALTER TABLE analysis_reports ADD COLUMN evidence_window_start DATETIME NULL;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='analysis_reports' AND COLUMN_NAME='evidence_window_end') THEN
    ALTER TABLE analysis_reports ADD COLUMN evidence_window_end DATETIME NULL;
  END IF;
END$$
DELIMITER ;

CALL add_missing_analysis_columns();
DROP PROCEDURE IF EXISTS add_missing_analysis_columns;

-- Verification:
-- SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS
--   WHERE TABLE_SCHEMA='twinops' AND TABLE_NAME='analysis_reports' AND COLUMN_NAME IN (
--     'engine','rca_status','root_causes_json','causal_graph_json','model_version',
--     'evidence_window_start','evidence_window_end'
--   );
