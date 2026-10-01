---
'@pmndrs/docs': minor
---

Headings nested in a component (`TabsContent`, `Details`, `Grid`...) now get an anchor and appear
in the table of contents, and a link to one in a hidden tab opens that tab. The same title twice
in a page now gets a `-1`, `-2`... suffixed anchor. Search content follows: a nested heading owns
the text of its component, and tab labels, imports and expressions are no longer indexed.
