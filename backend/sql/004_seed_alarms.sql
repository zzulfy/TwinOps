INSERT INTO alarms (
  device_code,
  device_name,
  event,
  level,
  status,
  occurred_at,
  acknowledged_at,
  resolved_at
)
SELECT
  d.device_code,
  d.name,
  CASE MOD(d.id, 5)
    WHEN 0 THEN '温度过高'
    WHEN 1 THEN '电流过高'
    WHEN 2 THEN '网络波动'
    WHEN 3 THEN '磁盘使用偏高'
    ELSE 'CPU负载过高'
  END AS event,
  CASE
    WHEN MOD(d.id, 9) = 0 THEN 3
    WHEN MOD(d.id, 4) = 0 THEN 2
    ELSE 1
  END AS level,
  CASE
    WHEN MOD(d.id, 8) = 0 THEN 'resolved'
    WHEN MOD(d.id, 3) = 0 THEN 'acknowledged'
    ELSE 'new'
  END AS status,
  DATE_SUB(NOW(), INTERVAL MOD(d.id * 3, 72) HOUR) AS occurred_at,
  CASE WHEN MOD(d.id, 3) = 0 THEN DATE_SUB(NOW(), INTERVAL MOD(d.id * 2, 48) HOUR) END AS acknowledged_at,
  CASE WHEN MOD(d.id, 8) = 0 THEN DATE_SUB(NOW(), INTERVAL MOD(d.id, 24) HOUR) END AS resolved_at
FROM devices d
WHERE d.id <= 35;
