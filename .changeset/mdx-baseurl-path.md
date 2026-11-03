---
'@pmndrs/docs': minor
---

`MDX_BASEURL` can be a path only, root-relative, e.g. `/react-three-fiber` or `/`: relative images then resolve to root-relative URLs, which follow the website onto any host it answers on, and their dimensions are still read from the `MDX` folder. The `image` frontmatter is made absolute against the origin of `NEXT_PUBLIC_URL` for `og:image`. A path used to throw `Invalid URL`; an absolute or empty `MDX_BASEURL` is unchanged.
