#!/usr/bin/env bash
set -euo pipefail

# Apply backend/sql/002_add_analysis_columns.sql to the target MySQL database.
# Usage:
#   HOST=127.0.0.1 PORT=3306 USER=root DB=twinops ./apply_migration.sh
# The script prompts for MySQL password interactively.

HOST=${HOST:-127.0.0.1}
PORT=${PORT:-3306}
USER=${USER:-root}
DB=${DB:-twinops}
SQL_FILE="$(dirname "$0")/../sql/002_add_analysis_columns.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "SQL file not found: $SQL_FILE" >&2
  exit 1
fi

read -s -p "MySQL password for $USER@$HOST: " MYSQL_PWD
echo
export MYSQL_PWD

mysql -h "$HOST" -P "$PORT" -u "$USER" "$DB" < "$SQL_FILE"

if [ $? -eq 0 ]; then
  echo "Migration applied successfully."
  unset MYSQL_PWD
  exit 0
else
  echo "Migration failed." >&2
  unset MYSQL_PWD
  exit 1
fi
