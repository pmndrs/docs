# Using `act` to Execute GitHub Workflows Locally

This document explains how to use `act` to test GitHub Actions workflows from this repository locally.

## Installing `act`

```bash
# Via GitHub binary (recommended)
cd /tmp
curl -L https://github.com/nektos/act/releases/latest/download/act_Linux_x86_64.tar.gz -o act.tar.gz
tar xzf act.tar.gz
sudo mv act /usr/local/bin/
act --version
```

## Available Workflows

This repository contains 4 workflows:

1. **ci.yml** - Main CI/CD workflow with Vercel and Docker deployment
2. **build.yml** - Reusable workflow for building documentation
3. **chromatic.yml** - Visual tests with Playwright and Chromatic
4. **docs.yml** - Documentation generation and deployment

## Useful Commands

### List available workflows and jobs

```bash
act -l
```

### Execute a workflow in dry-run mode (simulation)

```bash
# Test CI workflow
act -W .github/workflows/ci.yml -n

# Test playwright job from chromatic workflow
act -W .github/workflows/chromatic.yml -j playwright -n
```

### Execute a workflow for real (beware of side effects)

```bash
# Execute chromatic workflow (playwright job only)
act -W .github/workflows/chromatic.yml -j playwright

# Execute with environment variables
act -W .github/workflows/ci.yml --env GITHUB_TOKEN=xxx
```

## Limitations

⚠️ **Important**: Running workflows with `act` has limitations:

1. **Missing secrets**: GitHub secrets (VERCEL_TOKEN, CHROMATIC_PROJECT_TOKEN, etc.) are not available
2. **External services**: Deployments to Vercel, Docker registries, etc. will not work completely
3. **Compatibility**: Some GitHub Actions may behave differently with `act`
4. **Resources**: Workflows requiring many resources may fail

## Test Results

### ✅ ci.yml - Successful dry-run

The main workflow was tested in dry-run mode and all steps are validated:
- Setup job with Ubuntu image
- Cloning of necessary actions
- Simulation of all steps (checkout, pnpm install, vercel deploy, docker build, etc.)

### ✅ chromatic.yml - Successful dry-run

The `playwright` job was successfully tested:
- Use of official Playwright image
- Dependencies installation
- Playwright tests execution

## Conclusion

`act` is a powerful tool for:
- 🧪 Testing workflows locally before pushing
- 🐛 Debugging workflow issues
- ⚡ Rapidly iterating on CI/CD configurations

However, for complex workflows with external dependencies, dry-run mode (`-n`) is often the most useful for validating workflow syntax and structure.
