#!/usr/bin/env bash
# Daily Postgres backup. Install at /opt/mohassib/backup.sh, run via cron:
#   0 2 * * * /opt/mohassib/backup.sh >> /var/log/mohassib/backup.log 2>&1
set -euo pipefail

BACKUP_DIR="/var/backups/mohassib"
RETAIN_DAYS=14
TS="$(date -u +%Y%m%d_%H%M%S)"

# Source DB credentials from the same .env the backend uses.
set -a
. /opt/mohassib/.env
set +a

mkdir -p "$BACKUP_DIR"
DUMP_FILE="$BACKUP_DIR/mohassib_${TS}.sql.gz"

# Extract host/port/db from DB_URL (jdbc:postgresql://host:port/db).
URL="${DB_URL#jdbc:postgresql://}"
HOSTPORT="${URL%%/*}"
DBNAME="${URL##*/}"
DBHOST="${HOSTPORT%%:*}"
DBPORT="${HOSTPORT##*:}"
[ "$DBHOST" = "$DBPORT" ] && DBPORT=5432

PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DBHOST" -p "$DBPORT" -U "$DB_USER" -d "$DBNAME" \
    --no-owner --no-privileges \
    | gzip -9 > "$DUMP_FILE"

echo "$(date -u +%FT%TZ) backup ok: $DUMP_FILE ($(du -h "$DUMP_FILE" | cut -f1))"

# Retention.
find "$BACKUP_DIR" -name 'mohassib_*.sql.gz' -mtime +${RETAIN_DAYS} -delete
