#!/usr/bin/env bash
set -euo pipefail
log() { echo "[$(date '+%F %T')] $*"; }

REPO_DIR="/opt/CP3405-TR3-2025-P1T4"
BACKEND_DIR="$REPO_DIR/backend"
FRONTEND_DIR="$REPO_DIR/frontend"
VENV_BIN="$BACKEND_DIR/venv/bin"
SERVICE_BACKEND="cp3405-backend.service"

cd "$REPO_DIR"
log "Fetching latest changes..."
 git fetch origin main || true
LOCAL=$(git rev-parse main 2>/dev/null || echo "")
REMOTE=$(git rev-parse origin/main 2>/dev/null || echo "")

if [ -z "$LOCAL" ] || [ "$LOCAL" != "$REMOTE" ]; then
  log "Pulling updates..."
  git checkout main || true
  git pull --rebase origin main || true

  # Backend deps
  log "Updating backend deps..."
  if [ ! -x "$VENV_BIN/python" ]; then
    python3 -m venv "$BACKEND_DIR/venv"
  fi
  "$VENV_BIN/pip" install --upgrade pip
  "$VENV_BIN/pip" install -r "$BACKEND_DIR/requirements.txt"

  # Frontend build if app exists (supports app/ or src/app/)
  if [ -d "$FRONTEND_DIR/app" ] || [ -d "$FRONTEND_DIR/src/app" ]; then
    log "Building frontend (Expo static export)..."
    cd "$FRONTEND_DIR"
    if command -v npm >/dev/null 2>&1; then
      # Replace localhost with server IP for production
      log "Replacing localhost with 45.77.44.161 in API config..."
      sed -i 's|http://localhost:8000|http://45.77.44.161|g' src/api/config.ts
      
      npm ci || npm install --legacy-peer-deps
      npx expo export --platform web --output-dir /var/www/cp3405-frontend || {
        log "WARN: Frontend build failed, keeping previous version."
      }
      
      # Revert localhost replacement for next development
      log "Reverting config to localhost..."
      sed -i 's|http://45.77.44.161|http://localhost:8000|g' src/api/config.ts
      
      log "Reloading Nginx..."
      nginx -t && systemctl reload nginx || true
    else
      log "WARN: npm not found, skip frontend build."
    fi
  else
    log "No frontend app directory found. Skip frontend build."
  fi

  log "Restarting backend..."
  systemctl restart "$SERVICE_BACKEND"
  log "Update complete."
else
  log "No updates. Still rebuilding frontend to ensure latest build is served..."
  # Optional rebuild even if no git updates, to ensure assets are present
  if [ -d "$FRONTEND_DIR/app" ] || [ -d "$FRONTEND_DIR/src/app" ]; then
    cd "$FRONTEND_DIR"
    # Replace localhost with server IP for production
    log "Replacing localhost with 45.77.44.161 in API config..."
    sed -i 's|http://localhost:8000|http://45.77.44.161|g' src/api/config.ts
    
    npm ci || npm install --legacy-peer-deps
    npx expo export --platform web --output-dir /var/www/cp3405-frontend || true
    
    # Revert localhost replacement for next development
    log "Reverting config to localhost..."
    sed -i 's|http://45.77.44.161|http://localhost:8000|g' src/api/config.ts
    
    nginx -t && systemctl reload nginx || true
  fi
fi