#!/usr/bin/env bash
# One-shot TLS bootstrap. Run after `docker compose up -d nginx` so that the
# HTTP-only block is serving the certbot webroot.
#   sudo /opt/mohassib/repo/deploy/init-tls.sh
set -euo pipefail

DOMAIN="${DOMAIN:-mohassib.elguennouni.site}"
EMAIL="${EMAIL:-abdlilah.el.guennouni@gmail.com}"
REPO_DIR="${REPO_DIR:-/opt/mohassib/repo}"

docker run --rm \
    -v /etc/letsencrypt:/etc/letsencrypt \
    -v "$(docker volume inspect -f '{{ .Mountpoint }}' mohassib_certbot-webroot)":/var/www/certbot \
    certbot/certbot:latest \
    certonly --webroot -w /var/www/certbot \
        --email "$EMAIL" --agree-tos --no-eff-email \
        -d "$DOMAIN"

# Reload nginx so it picks up the freshly issued cert.
docker compose --env-file "$REPO_DIR/.env" -f "$REPO_DIR/docker-compose.prod.yml" exec nginx nginx -s reload
echo "TLS provisioned for $DOMAIN"
