# Pre-Push Validation Instructions for Copilot Agents

## Overview

Before pushing any code changes to the repository, agents MUST validate their changes by executing the CI workflow locally using `act`. This ensures code quality and catches issues before they reach the remote repository.

## Mandatory Pre-Push Workflow

### 1. Install `act` (if not already installed)

Before running any workflow tests, verify that `act` is installed:

```bash
# Check if act is installed
if ! command -v act &> /dev/null; then
    echo "Installing act..."
    cd /tmp
    curl -L https://github.com/nektos/act/releases/latest/download/act_Linux_x86_64.tar.gz -o act.tar.gz
    tar xzf act.tar.gz
    sudo mv act /usr/local/bin/
    act --version
fi
```

### 2. Run CI Workflow Validation (MANDATORY)

**ALWAYS** execute the following before using `report_progress` to push changes:

```bash
# Navigate to repository root
cd /home/runner/work/docs/docs

# Run CI workflow in dry-run mode
act -W .github/workflows/ci.yml -n
```

**Expected outcome:** The dry-run should complete successfully without errors. If it fails, investigate and fix the issues before pushing.

### 3. Validation Workflow Steps

Follow these steps in order:

#### Step 1: Make your code changes
- Implement the required features or fixes
- Follow existing code style and conventions

#### Step 2: Run local tests (if applicable)
```bash
# Run any relevant local tests
pnpm test  # or the appropriate test command
```

#### Step 3: Validate with act (REQUIRED)
```bash
# Test CI workflow in dry-run mode
act -W .github/workflows/ci.yml -n

# Alternative: Use the helper script
./scripts/test-workflows.sh ci --dry-run
```

#### Step 4: Check validation results
- ✅ If dry-run succeeds → Proceed to Step 5
- ❌ If dry-run fails → Fix the issues and return to Step 3

#### Step 5: Commit and push
```bash
# Only after successful validation, report progress
# The report_progress tool will handle git operations
```

## Using the Helper Script

For convenience, use the provided helper script:

```bash
# List all available workflows
./scripts/test-workflows.sh list

# Test CI workflow (recommended before every push)
./scripts/test-workflows.sh ci --dry-run

# Test specific workflow if needed
./scripts/test-workflows.sh chromatic --dry-run --job playwright
```

## Workflow Validation Requirements

### Required for ALL changes:
- **ci.yml** - Must pass dry-run validation

### Required for specific changes:
- **chromatic.yml** - When modifying UI components or Playwright tests
- **docs.yml** - When modifying documentation build process
- **build.yml** - When modifying the reusable build workflow

## Handling Validation Failures

If `act` dry-run fails:

1. **Review the error output carefully**
   - Look for syntax errors in workflow YAML
   - Check for missing dependencies or steps
   - Verify environment variable references

2. **Fix the identified issues**
   - Correct workflow syntax
   - Update action versions if needed
   - Ensure all required files exist

3. **Re-run validation**
   - Test again with `act -W .github/workflows/ci.yml -n`
   - Repeat until validation passes

4. **Do NOT push until validation succeeds**

## Examples

### Example 1: Standard Code Change

```bash
# 1. Make changes to code files
# ... edit files ...

# 2. Validate with act
act -W .github/workflows/ci.yml -n

# 3. If successful, report progress
# Use report_progress tool with appropriate message
```

### Example 2: Workflow Modification

```bash
# 1. Modify workflow file
# ... edit .github/workflows/ci.yml ...

# 2. Validate the workflow syntax
act -W .github/workflows/ci.yml -n

# 3. If dry-run passes, the workflow syntax is valid
# 4. Report progress
```

### Example 3: Multiple Workflow Changes

```bash
# If you modified multiple workflows, test them all
act -W .github/workflows/ci.yml -n
act -W .github/workflows/chromatic.yml -j playwright -n
act -W .github/workflows/docs.yml -n

# Only push after ALL validations pass
```

## Why This Matters

Running `act` before pushing:
- ✅ Catches workflow syntax errors before they break CI
- ✅ Validates that workflow steps are properly configured
- ✅ Prevents failed CI runs that waste resources
- ✅ Ensures faster feedback loop
- ✅ Maintains repository health

## Important Notes

### Limitations of `act`
- Some external services won't be available (Vercel, Chromatic, etc.)
- Secrets won't be accessible in local runs
- Dry-run mode (`-n`) validates structure without executing commands

### When to Skip
You may skip `act` validation ONLY for:
- Documentation-only changes (markdown files in `docs/`)
- README updates
- License or configuration files that don't affect CI

For ALL other changes, including:
- Source code modifications
- Workflow changes
- Dependency updates
- Build configuration changes

You MUST run `act` validation before pushing.

## Troubleshooting

### Issue: `act` not found
```bash
# Install act
cd /tmp
curl -L https://github.com/nektos/act/releases/latest/download/act_Linux_x86_64.tar.gz -o act.tar.gz
tar xzf act.tar.gz
sudo mv act /usr/local/bin/
```

### Issue: Docker not available
```bash
# Check Docker status
docker ps

# If Docker is not running, some `act` features may not work
# In this case, focus on workflow syntax validation
```

### Issue: Workflow takes too long
```bash
# Use dry-run mode (much faster)
act -W .github/workflows/ci.yml -n

# Or test specific jobs only
act -W .github/workflows/ci.yml -j main-job -n
```

## Summary Checklist

Before every `report_progress` call, verify:

- [ ] Code changes are complete and tested locally
- [ ] `act` is installed and available
- [ ] CI workflow validation executed: `act -W .github/workflows/ci.yml -n`
- [ ] Validation passed without errors
- [ ] Any other relevant workflows tested if modified
- [ ] Ready to push changes

## References

- Full documentation: [ACT_USAGE.md](../../ACT_USAGE.md)
- Helper script: [scripts/test-workflows.sh](../../scripts/test-workflows.sh)
- Detailed guide: [docs/act-demo.md](../../docs/act-demo.md)
- `act` official documentation: https://nektosact.com/

---

**Remember:** This validation step is mandatory for maintaining code quality and preventing CI failures. Always validate before pushing!
