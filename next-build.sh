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

exit $STATUS