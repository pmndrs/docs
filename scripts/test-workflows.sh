#!/bin/bash

# Script to test GitHub workflows with act
# Usage: ./scripts/test-workflows.sh [workflow-name] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Help function
show_help() {
    echo "Usage: $0 [workflow] [options]"
    echo ""
    echo "Available workflows:"
    echo "  ci          - Test main CI workflow"
    echo "  chromatic   - Test Chromatic workflow (Playwright)"
    echo "  build       - Test build workflow"
    echo "  docs        - Test documentation workflow"
    echo "  list        - List all workflows and jobs"
    echo ""
    echo "Options:"
    echo "  -n, --dry-run    Simulation mode (recommended)"
    echo "  -j, --job JOB    Execute a specific job"
    echo "  -h, --help       Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 list"
    echo "  $0 ci --dry-run"
    echo "  $0 chromatic --dry-run --job playwright"
}

# Check that act is installed
if ! command -v act &> /dev/null; then
    echo -e "${RED}Error: 'act' is not installed${NC}"
    echo "Install it with:"
    echo "  curl -L https://github.com/nektos/act/releases/latest/download/act_Linux_x86_64.tar.gz -o /tmp/act.tar.gz"
    echo "  tar xzf /tmp/act.tar.gz -C /tmp"
    echo "  sudo mv /tmp/act /usr/local/bin/"
    exit 1
fi

# Argument parsing
WORKFLOW=""
DRY_RUN=""
JOB=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--dry-run)
            DRY_RUN="-n"
            shift
            ;;
        -j|--job)
            JOB="-j $2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        list)
            echo -e "${GREEN}Available workflows:${NC}"
            act -l
            exit 0
            ;;
        ci|chromatic|build|docs)
            WORKFLOW="$1"
            shift
            ;;
        *)
            echo -e "${RED}Unknown argument: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# If no workflow specified, show help
if [ -z "$WORKFLOW" ]; then
    show_help
    exit 1
fi

# Build act command
WORKFLOW_FILE=".github/workflows/${WORKFLOW}.yml"

if [ ! -f "$WORKFLOW_FILE" ]; then
    echo -e "${RED}Error: Workflow file $WORKFLOW_FILE does not exist${NC}"
    exit 1
fi

echo -e "${GREEN}Executing workflow: ${WORKFLOW}${NC}"
echo -e "${YELLOW}File: ${WORKFLOW_FILE}${NC}"

if [ -n "$DRY_RUN" ]; then
    echo -e "${YELLOW}Mode: DRY-RUN (simulation)${NC}"
else
    echo -e "${RED}Mode: REAL EXECUTION${NC}"
    echo -e "${YELLOW}Warning: This command will actually execute the workflow!${NC}"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Canceled."
        exit 0
    fi
fi

# Execute act
echo ""
echo -e "${GREEN}Command: act -W $WORKFLOW_FILE $JOB $DRY_RUN${NC}"
echo ""

act -W "$WORKFLOW_FILE" $JOB $DRY_RUN
