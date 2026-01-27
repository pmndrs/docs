# Testing GitHub Workflows with `act`

This guide explains how to use `act` to execute and test GitHub Actions workflows locally in this repository.

> **Note for Copilot agents:** Specific instructions for pre-push validation are available in [.github/agents/README.md](.github/agents/README.md)

## 🎯 Objective

`act` allows you to:
- ✅ Test workflows locally before pushing to GitHub
- 🐛 Debug CI/CD issues quickly
- ⚡ Iterate on configurations without polluting Git history
- 🤖 Automatic validation for Copilot agents before each push

## 📦 Installing `act`

`act` has been installed and configured in this environment. If you want to install it elsewhere:

```bash
# Download and install the binary
cd /tmp
curl -L https://github.com/nektos/act/releases/latest/download/act_Linux_x86_64.tar.gz -o act.tar.gz
tar xzf act.tar.gz
sudo mv act /usr/local/bin/
act --version
```

## 🚀 Quick Start

### Via the helper script

We have created a convenient script to simplify usage:

```bash
# List all workflows
./scripts/test-workflows.sh list

# Test CI workflow in dry-run mode (recommended)
./scripts/test-workflows.sh ci --dry-run

# Test only the playwright job from chromatic workflow
./scripts/test-workflows.sh chromatic --dry-run --job playwright
```

### Via act command directly

```bash
# List available workflows
act -l

# Dry-run of CI workflow
act -W .github/workflows/ci.yml -n

# Dry-run of playwright job
act -W .github/workflows/chromatic.yml -j playwright -n

# Real execution (beware of side effects!)
act -W .github/workflows/chromatic.yml -j playwright
```

## 📋 Available Workflows

| Workflow | File | Description | Test Status |
|----------|------|-------------|-------------|
| **CI** | `ci.yml` | Main pipeline with Vercel & Docker | ✅ Tested |
| **Chromatic** | `chromatic.yml` | Playwright visual tests | ✅ Tested |
| **Build** | `build.yml` | Reusable workflow for docs | ℹ️ Workflow call |
| **Docs** | `docs.yml` | Documentation generation and deployment | ℹ️ Requires Pages |

## ⚠️ Important Limitations

### Missing Secrets

Workflows that require secrets will not work completely:
- `VERCEL_TOKEN` (for Vercel deployment)
- `CHROMATIC_PROJECT_TOKEN` (for Chromatic)
- `GITHUB_TOKEN` (limited GitHub API access)

### External Services

Some steps will fail without access to services:
- Vercel deployment
- Push to Docker Registry
- Publish to GitHub Pages
- Upload to Chromatic

### Recommended Mode: Dry-run

For most cases, **dry-run mode** (`-n`) is sufficient and recommended:
```bash
act -W .github/workflows/ci.yml -n
```

This mode:
- ✅ Validates workflow syntax
- ✅ Simulates all steps
- ✅ Does not actually execute commands
- ✅ No side effects

## 📊 Test Results Performed

### ✅ CI Workflow (ci.yml)

Successful dry-run test with all steps validated:

```
✅ Set up job
✅ actions/checkout@v6
✅ pnpm/action-setup@v4
✅ actions/setup-node@v6
✅ pnpm install --frozen-lockfile
✅ Check version bump
✅ Vercel deploy (simulated)
✅ Docker build-push (simulated)
✅ Complete job
```

**Duration**: ~13 seconds (dry-run)

### ✅ Chromatic Workflow - Playwright Job (chromatic.yml)

Successful dry-run test:

```
✅ Set up job
✅ actions/checkout@v6
✅ pnpm/action-setup@v4
✅ actions/setup-node@v6
✅ Install dependencies
✅ Run Playwright tests
✅ Upload artifact
✅ Complete job
```

**Duration**: ~8 seconds (dry-run)

## 🔧 Advanced Configuration

### Configuration file `~/.config/act/actrc`

To customize `act` behavior:

```bash
# Use medium image by default
-P ubuntu-latest=catthehacker/ubuntu:act-latest

# Disable repeated Docker pulls
--pull=false

# Default environment variables
--env GITHUB_TOKEN=ghp_xxxxx
```

### Using local secrets

Create a `.secrets` file (do not commit!):

```bash
VERCEL_TOKEN=xxx
CHROMATIC_PROJECT_TOKEN=xxx
```

Then use it:

```bash
act -W .github/workflows/ci.yml --secret-file .secrets
```

## 📚 Additional Documentation

- [Official act documentation](https://nektosact.com/)
- [Detailed guide in docs/act-demo.md](./docs/act-demo.md)
- [GitHub Actions Workflows](https://docs.github.com/en/actions)
- **[Instructions for Copilot agents](.github/agents/README.md)** - Mandatory pre-push validation

## 💡 Tips

1. **Always test in dry-run first**: `act -n`
2. **Use the helper script**: Simpler and safer
3. **Test job by job**: Use `-j <job-name>` to isolate tests
4. **Clean up Docker containers**: `docker ps -a | grep act` then `docker rm`
5. **For Copilot agents**: Always validate with `act` before `report_progress`

## 🤖 For Copilot Agents

**Mandatory pre-push validation:** Before each use of `report_progress`, you must:

```bash
# Validate CI workflow with act
act -W .github/workflows/ci.yml -n
```

See the [complete instructions for agents](.github/agents/README.md) for more details on:
- When to validate (for which types of changes)
- How to handle validation failures
- Complete pre-push validation process

This step is **mandatory** to maintain code quality and avoid CI failures.

## ❓ Help

For any questions or issues:

```bash
# Script help
./scripts/test-workflows.sh --help

# Act help
act --help

# View detailed logs
act -W .github/workflows/ci.yml -n --verbose
```

---

**Note**: This setup was tested and validated on 2026-01-27. The `ci.yml` and `chromatic.yml` (playwright job) workflows were successfully tested in dry-run mode.
