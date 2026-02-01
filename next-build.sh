#!/bin/sh

mkdir -p tmp
test "$OUTPUT" = "export" && mv src/app/api tmp/api-backup

next build
STATUS=$?

mv tmp/api-backup src/app/api 2>/dev/null

exit $STATUS