-- 003_add_report_column.sql
-- Adds the report column (LLM-generated comprehensive analysis report) to analysis_reports.

DELIMITER $$
DROP PROCEDURE IF EXISTS add_report_column$$
CREATE PROCEDURE add_report_column()
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='analysis_reports' AND COLUMN_NAME='report') THEN
    ALTER TABLE analysis_reports ADD COLUMN report TEXT NULL;
  END IF;
END$$
DELIMITER ;

CALL add_report_column();
DROP PROCEDURE IF EXISTS add_report_column;
