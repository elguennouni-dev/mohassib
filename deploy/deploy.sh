#!/usr/bin/env bash
# Build + deploy in place on the VPS. Run as the mohassib user from a clone of the repo.
#   sudo -u mohassib /opt/mohassib/repo/deploy/deploy.sh
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/mohassib/repo}"
APP_DIR="${APP_DIR:-/opt/mohassib}"
WEB_DIR="${WEB_DIR:-/var/www/mohassib}"

cd "$REPO_DIR"
git fetch --all --prune
git reset --hard origin/main

# Backend.
( cd backend && ./mvnw -q -DskipTests clean package )
JAR="$(ls -1 backend/target/mohassib-*.jar | head -n1)"
cp -f "$JAR" "$APP_DIR/app.jar.new"
mv -f "$APP_DIR/app.jar.new" "$APP_DIR/app.jar"

# Frontend.
( cd frontend && npm ci && npm run build )
sudo rsync -a --delete frontend/dist/ "$WEB_DIR/"

# Restart backend.
sudo systemctl restart mohassib

echo "Deployment OK"
