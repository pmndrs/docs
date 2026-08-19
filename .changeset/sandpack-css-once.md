---
'@pmndrs/docs': patch
---

Stop repeating the Sandpack stylesheet on every streamed chunk

`useServerInsertedHTML` is called back on each flush of the response and expects what is new
since the last one, but the callback returned the whole Sandpack stylesheet every time. Pages
carried one full copy per chunk — 145 identical copies of the same 8.9 kB on the worst of
them, three quarters of the page weight.

Which pages were hit moved from build to build: the stylesheet is a module-level singleton,
so it depended on whether a page using Sandpack had been rendered earlier in the same build
process. Pages with no Sandpack of their own paid for their neighbours.
