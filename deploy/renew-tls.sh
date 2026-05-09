#!/usr/bin/env bash
# Cron-driven Let's Encrypt renewal.
#   0 3 * * * /opt/mohassib/repo/deploy/renew-tls.sh >> /var/log/mohassib/tls.log 2>&1
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/mohassib/repo}"

docker run --rm \
    -v /etc/letsencrypt:/etc/letsencrypt \
    -v "$(docker volume inspect -f '{{ .Mountpoint }}' mohassib_certbot-webroot)":/var/www/certbot \
    certbot/certbot:latest renew --webroot -w /var/www/certbot --quiet

# Hot-reload nginx so a freshly renewed cert takes effect immediately.
docker compose --env-file "$REPO_DIR/.env" -f "$REPO_DIR/docker-compose.prod.yml" exec -T nginx nginx -s reload || true
