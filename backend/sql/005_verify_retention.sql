-- Telemetry records that violate 30-day retention should be 0.
SELECT COUNT(*) AS old_metric_records
FROM device_metrics
WHERE metric_time < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Quick dashboard sanity checks.
SELECT COUNT(*) AS device_count FROM devices;
SELECT COUNT(*) AS alarm_count FROM alarms;
SELECT COUNT(*) AS metric_count FROM device_metrics;
