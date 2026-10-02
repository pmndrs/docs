#!/bin/sh
#
# Next.js build wrapper for static export compatibility
#
# When building in export mode (OUTPUT=export), Next.js cannot handle Route Handlers
# (route.ts files) as they require server runtime. This script temporarily moves the
# server-only parts of the app out of the way during the build, then restores them
# afterward to preserve the source:
#   - src/app/api       the MCP server
#   - src/app/mcp/live  the live view of its requests, and their event stream
#
# Keep this list in step with `isExcluded` in src/cli/website.ts and the `!` entries of
# `files` in package.json.
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

# Move the server-only directories if building for export
if [ "$IS_EXPORT" = "true" ]; then
  mkdir -p tmp
  mv src/app/api tmp/api-backup
  mv src/app/mcp/live tmp/mcp-live-backup
fi

# Run Next.js build
next build
STATUS=$?

# Restore them if they were moved
if [ "$IS_EXPORT" = "true" ]; then
  mv tmp/api-backup src/app/api
  mv tmp/mcp-live-backup src/app/mcp/live
fi

# Each page's markdown is exported under `md/` (src/app/md/[...slug]/route.ts), but belongs
# beside the page, at `<path>.md`: the URL a server build rewrites to it.
EXPORT_DIR="${DIST_DIR:-out}"
if [ "$IS_EXPORT" = "true" ] && [ $STATUS -eq 0 ] && [ -d "$EXPORT_DIR/md" ]; then
  cp -R "$EXPORT_DIR/md/." "$EXPORT_DIR/"
  rm -rf "$EXPORT_DIR/md"
fi

exit $STATUS