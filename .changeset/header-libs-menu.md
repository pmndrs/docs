---
'@pmndrs/docs': minor
---

The library name in the header now opens a menu of the pmndrs libraries whose docs are built with
`@pmndrs/docs`, each with its icon; the one the site documents is checked and leads to the home of
its docs. `libs` gains a `pmndrs_docs` flag to mark
those libraries, and React Three Jolt, Sky and timeline join the list. The ".docs" suffix that
followed the name is gone, so the `libname_dotsuffix_label` and `libname_dotsuffix_href` inputs of
the reusable workflow, and the `--libname-dotsuffix-label` and `--libname-dotsuffix-href` options
of the CLI, are deprecated and now ignored. They are still accepted, so existing callers keep
working unchanged.
