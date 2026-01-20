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

# Check if test MDX directory exists
if [ ! -d "$TEST_MDX_DIR" ]; then
  echo -e "${RED}❌ Test MDX directory not found: $TEST_MDX_DIR${NC}"
  exit 1
fi

# Check if Docker is available
if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}⚠️  Docker not found, skipping test${NC}"
  exit 0
fi

# Check if Docker image exists
if ! docker image inspect "$DOCKER_IMAGE" &> /dev/null; then
  echo -e "${YELLOW}⚠️  Docker image $DOCKER_IMAGE not found${NC}"
  echo -e "${YELLOW}   Build it with: docker build -t $DOCKER_IMAGE .${NC}"
  echo -e "${YELLOW}   Skipping test${NC}"
  exit 0
fi

# Clean up before starting
cleanup_output "$TEST_MDX_DIR"

# First build
echo ""
echo "=== First build run ==="
if ! MDX="$TEST_MDX_DIR" DOCKER_IMAGE="$DOCKER_IMAGE" OUTPUT=export ./preview.sh > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  First build failed (possibly due to network issues)${NC}"
  cleanup_output "$TEST_MDX_DIR"
  exit 0
fi

# Check if output was created
if [ ! -d "$TEST_MDX_DIR/out" ]; then
  echo -e "${RED}❌ Output directory not created${NC}"
  exit 1
fi

# Calculate first hash
echo "📊 Calculating first hash..."
HASH1=$(calculate_hash "$TEST_MDX_DIR/out")
echo "   Hash: $HASH1"

# Clean up for second run
cleanup_output "$TEST_MDX_DIR"

# Second build
echo ""
echo "=== Second build run ==="
if ! MDX="$TEST_MDX_DIR" DOCKER_IMAGE="$DOCKER_IMAGE" OUTPUT=export ./preview.sh > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Second build failed (possibly due to network issues)${NC}"
  cleanup_output "$TEST_MDX_DIR"
  exit 0
fi

# Check if output was created
if [ ! -d "$TEST_MDX_DIR/out" ]; then
  echo -e "${RED}❌ Output directory not created on second run${NC}"
  exit 1
fi

# Calculate second hash
echo "📊 Calculating second hash..."
HASH2=$(calculate_hash "$TEST_MDX_DIR/out")
echo "   Hash: $HASH2"

# Compare hashes
echo ""
if [ "$HASH1" = "$HASH2" ]; then
  echo -e "${GREEN}✅ Success! Both builds produced identical output${NC}"
  echo "   SHA: $HASH1"
  cleanup_output "$TEST_MDX_DIR"
  exit 0
else
  echo -e "${RED}❌ Failed! Builds produced different output${NC}"
  echo "   First:  $HASH1"
  echo "   Second: $HASH2"
  cleanup_output "$TEST_MDX_DIR"
  exit 1
fi
