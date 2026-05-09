#!/usr/bin/env bash
# Pull latest code, rebuild containers, restart the stack. Run on the VPS.
#   sudo /opt/mohassib/repo/deploy/deploy.sh
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/mohassib/repo}"
COMPOSE_FILE="$REPO_DIR/docker-compose.prod.yml"
ENV_FILE="$REPO_DIR/.env"

cd "$REPO_DIR"
git fetch --all --prune
git reset --hard origin/main

# Build and roll. --no-deps avoids restarting postgres on every code push.
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build backend nginx
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --no-deps backend nginx

# Reap dangling images from the previous build.
docker image prune -f

echo
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
echo "Deployment OK"
