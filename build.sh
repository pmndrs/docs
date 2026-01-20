#!/bin/sh

# Shared build script for running Docker-based builds
# Usage: ./build.sh [MDX_DIR] [DOCKER_IMAGE]

set -e

MDX="${1:-docs}"
DOCKER_IMAGE="${2:-ghcr.io/pmndrs/docs:latest}"

# Build Docker image
docker build -t "$DOCKER_IMAGE" .

# Clean output directory
rm -rf "$MDX/out"

# Run Docker build
docker run --rm --init -t \
  -v "./$MDX":/app/docs \
  -e MDX=docs \
  -e NEXT_PUBLIC_LIBNAME="${NEXT_PUBLIC_LIBNAME:-Poimandres}" \
  -e NEXT_PUBLIC_LIBNAME_SHORT \
  -e NEXT_PUBLIC_LIBNAME_DOTSUFFIX_LABEL \
  -e NEXT_PUBLIC_LIBNAME_DOTSUFFIX_HREF \
  -e BASE_PATH \
  -e DIST_DIR="docs/out${BASE_PATH}" \
  -e OUTPUT=export \
  -e HOME_REDIRECT \
  -e MDX_BASEURL \
  -e SOURCECODE_BASEURL \
  -e EDIT_BASEURL \
  -e NEXT_PUBLIC_URL \
  -e ICON \
  -e LOGO \
  -e GITHUB \
  -e DISCORD \
  -e THEME_PRIMARY \
  -e THEME_SCHEME \
  -e THEME_CONTRAST \
  -e THEME_NOTE \
  -e THEME_TIP \
  -e THEME_IMPORTANT \
  -e THEME_WARNING \
  -e THEME_CAUTION \
  -e CONTRIBUTORS_PAT \
  ${DOCKER_IMAGE} pnpm run build
