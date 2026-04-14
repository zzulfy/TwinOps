SET NAMES utf8mb4;

DELETE FROM alarms;

INSERT INTO alarms (
  device_code,
  device_name,
  event,
  level,
  status,
  occurred_at
)
VALUES
  ('DEV009', '10号UPS输入输出柜', '关键指标异常', 3, 'new', '2026-04-12 23:00:00'),
  ('DEV013', '12号有源滤波柜', '关键指标异常', 3, 'new', '2026-04-12 23:00:00'),
  ('DEV014', '2号SVG无功补偿柜', '关键指标异常', 3, 'new', '2026-04-12 23:00:00'),
  ('DEV015', '2号智能控制柜', '关键指标异常', 3, 'new', '2026-04-12 23:00:00');
