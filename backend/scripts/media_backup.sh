#!/bin/bash
set -e

BACKUP_DIR="/var/www/IEA-STAYS-WEB/backups"
MEDIA_DIR="/var/www/IEA-STAYS-WEB/backend/app/static/uploads"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/iea_stays_media_$TIMESTAMP.tar.gz"

echo "=== Starting media assets backup at $(date) ==="
if [ -d "$MEDIA_DIR" ]; then
    # Archive the contents of the uploads folder
    tar -czf "$BACKUP_FILE" -C "$(dirname "$MEDIA_DIR")" uploads
    echo "Media backup completed successfully: $BACKUP_FILE"
else
    echo "Warning: Media directory does not exist at $MEDIA_DIR. Creating an empty archive."
    mkdir -p "$MEDIA_DIR"
    tar -czf "$BACKUP_FILE" -C "$(dirname "$MEDIA_DIR")" uploads
fi

# Apply retention policy: delete backups older than 7 days
echo "Applying media backup retention policy (7 days)..."
find "$BACKUP_DIR" -name "iea_stays_media_*.tar.gz" -mtime +7 -delete
echo "=== Media backup cycle completed ==="
