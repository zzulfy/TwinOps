Migration scripts for TwinOps backend

This folder contains migration helpers and SQL files used to keep the database schema in sync with the application.

Files
- 002_add_analysis_columns.sql: Adds missing RCA/evidence columns to `analysis_reports` table if they do not exist. It uses `information_schema` checks so it is safe for the MySQL 8 Docker deployment.
- 002_add_analysis_columns_compat.sql: Compatibility copy retained for older migration workflows. It is idempotent and can be executed after `002_add_analysis_columns.sql`.
- ../scripts/apply_migration.ps1: PowerShell helper to run the migration on Windows.
- ../scripts/apply_migration.sh: Shell helper to run the migration on Linux/macOS.

Recommended steps to apply migration (safe workflow)

1. Backup the table (required):

```bash
mysqldump -h <host> -P <port> -u <user> -p <database> analysis_reports > analysis_reports_backup.sql
```

2. Inspect existing columns:

```bash
mysql -h <host> -P <port> -u <user> -p -e "USE twinops; DESCRIBE analysis_reports;"
```

3. Apply the migration (choose one):

- Linux/macOS:

```bash
HOST=127.0.0.1 PORT=3306 USER=root DB=twinops ./backend/scripts/apply_migration.sh
```

- Windows (PowerShell):

```powershell
Set-Location -Path .\backend\scripts
.\apply_migration.ps1 -Host 127.0.0.1 -Port 3306 -User root -Database twinops
```

4. Verify columns were added:

```bash
mysql -h <host> -P <port> -u <user> -p -e "USE twinops; SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='twinops' AND TABLE_NAME='analysis_reports' AND COLUMN_NAME IN ('engine','rca_status','root_causes_json','causal_graph_json','model_version','evidence_window_start','evidence_window_end');"
```

5. Test the API:

```bash
curl -i "http://127.0.0.1:8080/api/analysis/reports?limit=1"
```

Notes
- Execute migrations during a maintenance window; backup beforehand.
- Consider adopting Flyway or Liquibase for future automated migrations.
