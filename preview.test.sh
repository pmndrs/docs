#!/bin/bash

set -e

TEST_MDX_DIR="test-mdx"
DOCKER_IMAGE="${DOCKER_IMAGE:-pmndrs-docs-local:test}"
EXPECTED_HASH_FILE="test-mdx/.expected-hash"

# Function to calculate directory hash
calculate_hash() {
  local dir=$1
  find "$dir" -type f -exec sha256sum {} \; | sort -k 2 | sha256sum | awk '{print $1}'
}

# Clean up before starting (using sudo since Docker creates files as root)
sudo rm -rf "$TEST_MDX_DIR/out"

# Run build (use docs as MDX inside container, but mount test-mdx)
docker run --rm --init -t \
  -v "./$TEST_MDX_DIR":/app/docs \
  -e MDX=docs \
  -e NEXT_PUBLIC_LIBNAME=TestLib \
  -e DIST_DIR="docs/out" \
  -e OUTPUT=export \
  $DOCKER_IMAGE pnpm run build > /dev/null 2>&1

# Calculate hash
HASH=$(calculate_hash "$TEST_MDX_DIR/out")

# Compare with expected
EXPECTED_HASH=$(cat "$EXPECTED_HASH_FILE")

if [ "$HASH" != "$EXPECTED_HASH" ]; then
  echo "Hash mismatch!"
  echo "  Expected: $EXPECTED_HASH"
  echo "  Got:      $HASH"
  echo "To update: echo '$HASH' > $EXPECTED_HASH_FILE"
  exit 1
fi

# Clean up (using sudo since Docker creates files as root)
sudo rm -rf "$TEST_MDX_DIR/out"
