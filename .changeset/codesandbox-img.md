---
'@pmndrs/docs': minor
---

`<Codesandbox>` takes its preview image from a new `img` prop, since CodeSandbox no longer serves
sandbox screenshots and every preview had turned into a broken image. Like an `<img src>`, `img` can
be relative to the page, which also gets its dimensions read, or a full URL. The same image is the
page's thumb in `<Entries>`. Without `img`, a neutral placeholder with the CodeSandbox mark stands
in, still linking to the sandbox, and `<Entries>` shows the mark alone. `screenshot_url`, the
former undocumented name of `img`, still works but is deprecated.
