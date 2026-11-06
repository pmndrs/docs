---
'@pmndrs/docs': minor
---

Remove the terminal reader: `pmndrs-docs browse` (the default command, built on Ink) is gone, and with it the "View in CLI" entry of a page's actions menu. `pmndrs-docs search` stays, and so does the MCP server, which is where reading the published documentation from an agent belongs. `ink` leaves the package's dependencies, so every install is lighter.
