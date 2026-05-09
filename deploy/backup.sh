#!/usr/bin/env bash
# Daily Postgres backup. Dumps from the running container via `docker exec`.
# Cron entry (host root):
#   0 2 * * * /opt/mohassib/repo/deploy/backup.sh >> /var/log/mohassib/backup.log 2>&1
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/mohassib/repo}"
ENV_FILE="$REPO_DIR/.env"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/mohassib}"
RETAIN_DAYS="${RETAIN_DAYS:-14}"
SERVICE="postgres"
TS="$(date -u +%Y%m%d_%H%M%S)"

# Source DB name + user from the same .env Compose uses.
set -a
. "$ENV_FILE"
set +a

mkdir -p "$BACKUP_DIR"
DUMP_FILE="$BACKUP_DIR/mohassib_${TS}.sql.gz"

CONTAINER_ID="$(docker compose --env-file "$ENV_FILE" -f "$REPO_DIR/docker-compose.prod.yml" ps -q "$SERVICE")"
if [ -z "$CONTAINER_ID" ]; then
    echo "$(date -u +%FT%TZ) backup FAILED: postgres container not running"
    exit 1
fi

docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" "$CONTAINER_ID" \
    pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges \
    | gzip -9 > "$DUMP_FILE"

SIZE="$(du -h "$DUMP_FILE" | cut -f1)"
echo "$(date -u +%FT%TZ) backup ok: $DUMP_FILE ($SIZE)"

find "$BACKUP_DIR" -name 'mohassib_*.sql.gz' -mtime +"$RETAIN_DAYS" -delete
