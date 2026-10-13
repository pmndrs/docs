# Consumer configuration integration test

Run `node scripts/test-consumer-config.mjs` after installing the repository dependencies and
Playwright's Chrome for Testing browser (`pnpm exec playwright install chromium`). Set
`CHROME_FOR_TESTING_PATH` to use another Chrome for Testing executable.

The runner copies these consumers outside the engine checkout with an independent React installation,
compiles the real CLI, and checks:

- automatic configuration discovery, explicit `--config`, and `DOCS_CONFIG` for fragment builds;
- file, folder, and stdin inputs using the same unchanged MDX;
- a local asynchronous server component, structured JSON data, and a local client component;
- the static website export and an increment after client hydration in its served preview;
- fragment and website generation without a consumer configuration;
- byte-identical consumer MDX after export.

The browser runs headless with a disposable profile. Both website builds run sequentially because
CLI exports share a staging directory. The runner is deliberately separate from the unit suite:
Next builds and browser hydration are needed to exercise the server/client module boundary.
