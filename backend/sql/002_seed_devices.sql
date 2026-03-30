SET NAMES utf8mb4;

DELETE FROM devices;

INSERT INTO devices (
  device_code,
  label_key,
  name,
  type,
  status,
  serial_number,
  location
)
WITH RECURSIVE seq AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 50
)
SELECT
  CONCAT('DEV', LPAD(n, 3, '0')) AS device_code,
  CONCAT(
    CASE
      WHEN n <= 15 THEN n
      WHEN n <= 30 THEN n - 15
      ELSE n - 30
    END,
    '# ',
    CASE
      WHEN n <= 15 THEN '服务器机柜'
      WHEN n <= 30 THEN '网络设备'
      ELSE '电源柜'
    END
  ) AS label_key,
  CONCAT(
    CASE
      WHEN n <= 15 THEN n
      WHEN n <= 30 THEN n - 15
      ELSE n - 30
    END,
    '# ',
    CASE
      WHEN n <= 15 THEN '服务器机柜'
      WHEN n <= 30 THEN '网络设备'
      ELSE '电源柜'
    END
  ) AS name,
  CASE
    WHEN n <= 15 THEN '服务器机柜'
    WHEN n <= 30 THEN '网络设备'
    ELSE '电源柜'
  END AS type,
  CASE
    WHEN MOD(n, 11) = 0 THEN 'error'
    WHEN MOD(n, 7) = 0 THEN 'warning'
    ELSE 'normal'
  END AS status,
  CONCAT('SN', LPAD(n * 17, 6, '0')) AS serial_number,
  CONCAT('数据中心 A 区 ', ((n - 1) DIV 10) + 1, ' 排') AS location
FROM seq;
