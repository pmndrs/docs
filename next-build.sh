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

mkdir -p tmp
test "$OUTPUT" = "export" && mv src/app/api tmp/api-backup

next build
STATUS=$?

mv tmp/api-backup src/app/api 2>/dev/null

exit $STATUS