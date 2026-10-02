---
'@pmndrs/docs': minor
---

A contrast toggle next to the theme color and light/dark switches: each click cycles the palette's Material contrast level -- standard, medium, high -- remembered across pages, reloads and tabs, and shown from the first paint. Code blocks now keep their dark background at every level: they were built on the `*-fixed` roles, which Material keeps across light and dark but not across contrast levels.
