#!/bin/sh
#
# Next.js build wrapper for static export compatibility
#
# When building in export mode (OUTPUT=export), Next.js cannot handle Route Handlers
# (route.ts files) as they require server runtime. This script temporarily moves the
# server-only parts of the app out of the way during the build, then restores them
# afterward to preserve the source:
#   - src/app/api       the Route Handlers (MCP server, its event stream)
#   - src/app/mcp/live  the page that streams from them
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
  mkdir -p tmp/mcp-backup
  mv src/app/api tmp/api-backup
  mv src/app/mcp/live tmp/mcp-backup/live
fi

# Run Next.js build
next build
STATUS=$?

# Restore them if they were moved
if [ "$IS_EXPORT" = "true" ]; then
  mv tmp/api-backup src/app/api
  mv tmp/mcp-backup/live src/app/mcp/live
  rmdir tmp/mcp-backup
fi

exit $STATUS
