SET NAMES utf8mb4;

DELETE FROM device_metrics;

INSERT INTO device_metrics (
  device_code,
  metric_time,
  temperature,
  humidity,
  voltage,
  current,
  power,
  cpu_load,
  memory_usage,
  disk_usage,
  network_traffic
)
WITH RECURSIVE hours AS (
  SELECT 0 AS h
  UNION ALL
  SELECT h + 1 FROM hours WHERE h < 47
)
SELECT
  d.device_code,
  DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-%d %H:00:00'), INTERVAL h HOUR) AS metric_time,
  20 + MOD(d.id + h, 12) + MOD(h, 3) * 0.3 AS temperature,
  45 + MOD(d.id * 2 + h, 28) AS humidity,
  218 + MOD(d.id + h, 8) AS voltage,
  5 + MOD(d.id + h, 6) * 0.5 AS current,
  1100 + MOD(d.id * 11 + h * 7, 900) AS power,
  20 + MOD(d.id * 3 + h * 2, 70) AS cpu_load,
  25 + MOD(d.id * 5 + h * 3, 65) AS memory_usage,
  30 + MOD(d.id * 7 + h * 5, 60) AS disk_usage,
  120 + MOD(d.id * 13 + h * 17, 900) AS network_traffic
FROM devices d
CROSS JOIN hours;
