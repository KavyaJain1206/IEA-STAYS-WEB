#!/bin/bash
set -e

BACKUP_DIR="/var/www/IEA-STAYS-WEB/backups"
LOG_FILE="$BACKUP_DIR/backup.log"
mkdir -p "$BACKUP_DIR"

echo "==========================================" >> "$LOG_FILE"
echo "Backup cycle started at $(date)" >> "$LOG_FILE"

# Run database backup
if [ -f "/var/www/IEA-STAYS-WEB/backend/scripts/db_backup.sh" ]; then
    /var/www/IEA-STAYS-WEB/backend/scripts/db_backup.sh >> "$LOG_FILE" 2>&1
    echo "Database backup step completed." >> "$LOG_FILE"
else
    echo "Error: db_backup.sh not found." >> "$LOG_FILE"
fi

# Run media backup
if [ -f "/var/www/IEA-STAYS-WEB/backend/scripts/media_backup.sh" ]; then
    /var/www/IEA-STAYS-WEB/backend/scripts/media_backup.sh >> "$LOG_FILE" 2>&1
    echo "Media backup step completed." >> "$LOG_FILE"
else
    echo "Error: media_backup.sh not found." >> "$LOG_FILE"
fi

echo "Backup cycle completed successfully at $(date)" >> "$LOG_FILE"
echo "==========================================" >> "$LOG_FILE"

echo "Backup execution finished successfully. Logs written to $LOG_FILE"
