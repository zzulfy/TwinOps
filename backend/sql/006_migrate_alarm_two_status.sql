SET @has_ack_col = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'alarms'
    AND COLUMN_NAME = 'acknowledged_at'
);

SET @migrate_alarm_status_sql = IF(
  @has_ack_col > 0,
  'UPDATE alarms
   SET status = ''resolved'',
       resolved_at = COALESCE(resolved_at, acknowledged_at, NOW())
   WHERE status = ''acknowledged''',
  'UPDATE alarms
   SET status = ''resolved'',
       resolved_at = COALESCE(resolved_at, NOW())
   WHERE status = ''acknowledged'''
);

PREPARE migrate_alarm_status_stmt FROM @migrate_alarm_status_sql;
EXECUTE migrate_alarm_status_stmt;
DEALLOCATE PREPARE migrate_alarm_status_stmt;

SET @drop_ack_col_sql = IF(
  @has_ack_col > 0,
  'ALTER TABLE alarms DROP COLUMN acknowledged_at',
  'SELECT 1'
);

PREPARE drop_ack_col_stmt FROM @drop_ack_col_sql;
EXECUTE drop_ack_col_stmt;
DEALLOCATE PREPARE drop_ack_col_stmt;
