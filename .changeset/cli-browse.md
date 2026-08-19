---
'@pmndrs/docs': minor
---

Read the published pmndrs documentation from the terminal: `npx @pmndrs/docs`.

Two new commands, both reading each library's published `llms-full.txt` — one GET per library, cached for an hour under `~/.cache/pmndrs-docs`, `--refresh` to fetch again:

- `browse [target]`, the default command, is a reader: pages on the left, the page on the right, `b` folds the sidebar away, `/` searches every library at once, `o` opens the page in a browser. A target lands straight where it points — `drei`, `drei/performances/instances`, or a query.
- `search <query>` is the same search with no screen: one result per line on stdout, in the `{lib} {path} - {title}` shape the MCP server publishes its index in, so a pipe or an agent can read it. `--in` narrows to a library, or to the matching lines of a single page.

Outside a terminal `browse` writes the page it was pointed at to stdout, rather than opening anything.

`build` is unaffected, and does not pay for this: the terminal UI is loaded only when the reader opens. It does add `ink` to the package's dependencies, so every install pulls it.
