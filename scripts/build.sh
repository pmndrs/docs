#!/bin/sh
set -e

# Build script that handles static export mode
# When OUTPUT=export, temporarily moves API routes for Next.js static export
# Always restores the files afterward (even if build fails)

API_DIR="src/app/api"
BACKUP_DIR=".api-backup"
SHOULD_MOVE=false

# Check if we need to move API directory for static export
if [ "$OUTPUT" = "export" ]; then
  echo "Static export mode detected - temporarily moving $API_DIR to $BACKUP_DIR"
  SHOULD_MOVE=true
  
  # Set up trap to restore files even if build fails
  trap 'if [ -d "$BACKUP_DIR" ]; then mv "$BACKUP_DIR" "$API_DIR"; echo "Restored $API_DIR"; fi' EXIT
  
  # Move API directory to backup location
  mv "$API_DIR" "$BACKUP_DIR"
fi

# Run Next.js build
echo "Running Next.js build..."
next build

# If we moved files, restore them (trap will also do this)
if [ "$SHOULD_MOVE" = true ]; then
  echo "Build completed - restoring $API_DIR"
  if [ -d "$BACKUP_DIR" ]; then
    mv "$BACKUP_DIR" "$API_DIR"
  fi
fi
