-- Telemetry records that violate 30-day retention should be 0.
SELECT COUNT(*) AS old_metric_records
FROM device_metrics
WHERE metric_time < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Dataset-driven seed consistency checks (current seed contains 32 devices).
SELECT
  CASE WHEN COUNT(*) = 32 THEN 'PASS' ELSE CONCAT('FAIL(', COUNT(*), ')') END AS device_count_check,
  COUNT(*) AS device_count
FROM devices;

SELECT COUNT(*) AS blank_label_key_count
FROM devices
WHERE label_key IS NULL OR TRIM(label_key) = '';

SELECT COUNT(*) AS duplicate_label_key_group_count
FROM (
  SELECT label_key
  FROM devices
  GROUP BY label_key
  HAVING COUNT(*) > 1
) AS duplicated;

SELECT
  CASE WHEN COUNT(*) = 1536 THEN 'PASS' ELSE CONCAT('FAIL(', COUNT(*), ')') END AS metric_count_check,
  COUNT(*) AS metric_count
FROM device_metrics;

SELECT COUNT(*) AS devices_without_metrics
FROM devices d
LEFT JOIN (
  SELECT DISTINCT device_code FROM device_metrics
) m ON m.device_code = d.device_code
WHERE m.device_code IS NULL;

SELECT COUNT(*) AS metric_orphan_devices
FROM device_metrics m
LEFT JOIN devices d ON d.device_code = m.device_code
WHERE d.device_code IS NULL;

SELECT COUNT(*) AS alarm_orphan_devices
FROM alarms a
LEFT JOIN devices d ON d.device_code = a.device_code
WHERE d.device_code IS NULL;

SELECT
  CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL(0)' END AS aggregated_target_check,
  COUNT(*) AS aggregated_target_count
FROM devices
WHERE status IN ('warning', 'error');

-- Quick dashboard sanity checks.
SELECT COUNT(*) AS alarm_count FROM alarms;
