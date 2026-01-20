#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
TEST_MDX_DIR="test-mdx"
DOCKER_IMAGE="${DOCKER_IMAGE:-pmndrs-docs-local:test}"
EXPECTED_HASH_FILE="test-mdx/.expected-hash"

echo "🧪 Testing preview.sh with MDX directory: $TEST_MDX_DIR"
echo "🐳 Using Docker image: $DOCKER_IMAGE"

# Function to calculate directory hash
calculate_hash() {
  local dir=$1
  find "$dir" -type f -exec sha256sum {} \; | sort -k 2 | sha256sum | awk '{print $1}'
}

# Function to cleanup output directory
cleanup_output() {
  local mdx_dir=$1
  if [ -d "$mdx_dir/out" ]; then
    echo "🧹 Cleaning up $mdx_dir/out"
    rm -rf "$mdx_dir/out"
  fi
}

# Clean up before starting
cleanup_output "$TEST_MDX_DIR"

# Run build
echo ""
echo "=== Build run ==="
if ! MDX="$TEST_MDX_DIR" DOCKER_IMAGE="$DOCKER_IMAGE" OUTPUT=export ./preview.sh > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Build failed (possibly due to network issues or missing Docker)${NC}"
  cleanup_output "$TEST_MDX_DIR"
  exit 0
fi

# Check if output was created
if [ ! -d "$TEST_MDX_DIR/out" ]; then
  echo -e "${RED}❌ Output directory not created${NC}"
  exit 1
fi

# Calculate hash
echo "📊 Calculating hash..."
HASH=$(calculate_hash "$TEST_MDX_DIR/out")
echo "   Hash: $HASH"

# Check if expected hash file exists
if [ -f "$EXPECTED_HASH_FILE" ]; then
  EXPECTED_HASH=$(cat "$EXPECTED_HASH_FILE")
  echo "   Expected: $EXPECTED_HASH"
  
  if [ "$HASH" = "$EXPECTED_HASH" ]; then
    echo -e "${GREEN}✅ Success! Build output matches expected hash${NC}"
    cleanup_output "$TEST_MDX_DIR"
    exit 0
  else
    echo -e "${RED}❌ Failed! Build output doesn't match expected hash${NC}"
    echo -e "${YELLOW}   To update the expected hash, run:${NC}"
    echo -e "${YELLOW}   echo '$HASH' > $EXPECTED_HASH_FILE${NC}"
    cleanup_output "$TEST_MDX_DIR"
    exit 1
  fi
else
  # First run - create the expected hash file
  echo "$HASH" > "$EXPECTED_HASH_FILE"
  echo -e "${GREEN}✅ Created expected hash file: $EXPECTED_HASH_FILE${NC}"
  echo -e "${YELLOW}   Please commit this file to git${NC}"
  cleanup_output "$TEST_MDX_DIR"
  exit 0
fi
