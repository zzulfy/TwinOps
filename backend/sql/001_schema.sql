-- Active: 1775211594559@@127.0.0.1@3306@twinops
CREATE TABLE IF NOT EXISTS devices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  device_code VARCHAR(64) NOT NULL,
  label_key VARCHAR(128) NOT NULL,
  name VARCHAR(128) NOT NULL,
  type VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'normal',
  serial_number VARCHAR(64) NOT NULL,
  location VARCHAR(128) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_device_code (device_code),
  UNIQUE KEY uk_label_key (label_key),
  KEY idx_device_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS device_metrics (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  device_code VARCHAR(64) NOT NULL,
  metric_time DATETIME NOT NULL,
  temperature DECIMAL(8,2) NOT NULL,
  humidity DECIMAL(8,2) NOT NULL,
  voltage DECIMAL(8,2) NOT NULL,
  current DECIMAL(8,2) NOT NULL,
  power DECIMAL(10,2) NOT NULL,
  cpu_load DECIMAL(8,2) NOT NULL,
  memory_usage DECIMAL(8,2) NOT NULL,
  disk_usage DECIMAL(8,2) NOT NULL,
  network_traffic DECIMAL(10,2) NOT NULL,
  UNIQUE KEY uk_metric_device_time (device_code, metric_time),
  KEY idx_metric_time (metric_time),
  KEY idx_metric_device_time_desc (device_code, metric_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS alarms (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  device_code VARCHAR(64) NOT NULL,
  device_name VARCHAR(128) NOT NULL,
  event VARCHAR(128) NOT NULL,
  level TINYINT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'new',
  occurred_at DATETIME NOT NULL,
  acknowledged_at DATETIME NULL,
  resolved_at DATETIME NULL,
  KEY idx_alarm_device_time (device_code, occurred_at),
  KEY idx_alarm_status_time (status, occurred_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS analysis_reports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  device_code VARCHAR(64) NOT NULL,
  metric_summary TEXT NOT NULL,
  idempotency_key VARCHAR(128) NULL,
  prediction TEXT NULL,
  confidence DECIMAL(5,2) NULL,
  risk_level VARCHAR(32) NULL,
  recommended_action TEXT NULL,
  status VARCHAR(32) NOT NULL,
  error_message VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_analysis_idempotency_key (idempotency_key),
  KEY idx_analysis_device_time (device_code, created_at),
  KEY idx_analysis_status_time (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_watchlist (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_username VARCHAR(64) NOT NULL,
  device_code VARCHAR(64) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_admin_watch_device (admin_username, device_code),
  KEY idx_watch_device (device_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
