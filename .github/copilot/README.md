# Pre-Push Validation

Before every `report_progress`, run:

```bash
act -W .github/workflows/ci.yml -n
```

Note: `act` may take 1-2 minutes to complete. Do not use `timeout` - it needs time to clone actions.

If `act` is not installed:

```bash
cd /tmp && curl -L https://github.com/nektos/act/releases/latest/download/act_Linux_x86_64.tar.gz -o act.tar.gz && tar xzf act.tar.gz && sudo mv act /usr/local/bin/
mkdir -p ~/.config/act && echo "-P ubuntu-latest=catthehacker/ubuntu:act-latest" > ~/.config/act/actrc
```

Skip validation only for documentation-only changes (`.md` files in `docs/`).
