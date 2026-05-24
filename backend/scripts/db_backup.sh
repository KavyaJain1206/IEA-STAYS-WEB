#!/bin/bash
set -e

BACKUP_DIR="/var/www/IEA-STAYS-WEB/backups"
mkdir -p "$BACKUP_DIR"

# Source the environment file
ENV_FILE="/var/www/IEA-STAYS-WEB/backend/.env"
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

# Handle both uppercase and lowercase env variable names
DB_CONN_STR=${database_url:-${DATABASE_URL:-"postgresql+psycopg://ieastays_user:ieastays123@127.0.0.1:5432/ieastays_prod"}}

# Standardize database scheme for pg_dump
PG_CONN_URL=$(echo "$DB_CONN_STR" | sed 's/postgresql+psycopg/postgresql/')

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/iea_stays_backup_$TIMESTAMP.sql.gz"

echo "=== Starting database backup at $(date) ==="
pg_dump -d "$PG_CONN_URL" | gzip > "$BACKUP_FILE"
echo "Database backup completed successfully: $BACKUP_FILE"

# Apply retention policy: delete backups older than 7 days
echo "Applying backup retention policy (7 days)..."
find "$BACKUP_DIR" -name "iea_stays_backup_*.sql.gz" -mtime +7 -delete
echo "=== Database backup cycle completed ==="
