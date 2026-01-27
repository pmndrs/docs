# Copilot Agent Instructions

## Pre-Push Requirements

**MANDATORY:** Before every `report_progress` call, execute CI workflow validation with `act`.

## Quick Validation Command

```bash
cd /home/runner/work/docs/docs
act -W .github/workflows/ci.yml -n
```

Or use the helper script:

```bash
./scripts/test-workflows.sh ci --dry-run
```

## When to Validate

### ✅ ALWAYS validate for:
- Source code changes
- Workflow modifications
- Dependency updates
- Build configuration changes
- Any changes that affect CI/CD

### ⏭️ May skip validation for:
- Documentation-only changes (`.md` files in `docs/`)
- README updates
- License or basic config files that don't affect builds

## Installation (if needed)

```bash
if ! command -v act &> /dev/null; then
    cd /tmp
    curl -L https://github.com/nektos/act/releases/latest/download/act_Linux_x86_64.tar.gz -o act.tar.gz
    tar xzf act.tar.gz
    sudo mv act /usr/local/bin/
fi
```

## Workflow Integration

```bash
# 1. Make your code changes
# ... edit files ...

# 2. REQUIRED: Validate with act
act -W .github/workflows/ci.yml -n

# 3. Fix any issues if validation fails
# ... fix errors ...

# 4. Only after validation passes, use report_progress
# ... commit and push ...
```

## Exit Criteria

Before pushing, ensure:
- [ ] `act -W .github/workflows/ci.yml -n` completes successfully
- [ ] No workflow syntax errors
- [ ] All validation steps passed

## Handling Failures

If validation fails:
1. Read the error output from `act`
2. Fix the identified issues
3. Re-run validation
4. Do NOT push until validation succeeds

## Documentation

For complete details, see [pre-push-validation.md](./pre-push-validation.md)

---

**Important:** This validation step is not optional. It prevents CI failures and maintains repository health.
