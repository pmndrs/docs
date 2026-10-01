#!/bin/sh
#
# Next.js build wrapper for static export compatibility
#
# When building in export mode (OUTPUT=export), Next.js cannot handle Route Handlers
# (route.ts files) as they require server runtime. This script temporarily moves the
# /api directory during the build, then restores it afterward to preserve the source.
#
# Usage:
#   OUTPUT=export npm run build  # Static export (GitHub Pages)
#   npm run build                # Server build (Vercel)

# Check if we're building in export mode
if [ "$OUTPUT" = "export" ]; then
  IS_EXPORT=true
else
  IS_EXPORT=false
fi

# Move API directory if building for export
if [ "$IS_EXPORT" = "true" ]; then
  mkdir -p tmp
  mv src/app/api tmp/api-backup
fi

# Run Next.js build
next build
STATUS=$?

# Restore API directory if it was moved
if [ "$IS_EXPORT" = "true" ]; then
  mv tmp/api-backup src/app/api
fi

# Each page's markdown is exported under `md/` (src/app/md/[...slug]/route.ts), but belongs
# beside the page, at `<path>.md`: the URL a server build rewrites to it.
EXPORT_DIR="${DIST_DIR:-out}"
if [ "$IS_EXPORT" = "true" ] && [ $STATUS -eq 0 ] && [ -d "$EXPORT_DIR/md" ]; then
  cp -R "$EXPORT_DIR/md/." "$EXPORT_DIR/"
  rm -rf "$EXPORT_DIR/md"
fi

exit $STATUS