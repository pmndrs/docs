# Pmndrs libraries docs

## Current libraries

- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [React Spring](https://docs.pmnd.rs/react-spring)
- [Drei](https://docs.pmnd.rs/drei)
- [Zustand](https://docs.pmnd.rs/zustand)

## How to run locally

```sh
git clone git@github.com:pmndrs/website.git
cd website
git checkout docs
yarn
yarn dev
```

## How to add a library

- Add all the docs in `/docs/your-library`
- Add the menu item for it in [components/LibSwitcher](https://github.com/pmndrs/website/blob/docs/components/LibSwitcher.tsx#L21)
- Add SEO and share images in [components/Seo](https://github.com/pmndrs/website/blob/docs/components/Seo.tsx)
- Add any redirects by creating a new page at `your-library/index.jsx` and placing the redirect in it.
  - You should redirect to the first chapter of your docs.
  - You can see an example [here](https://github.com/pmndrs/website/blob/docs/pages/react-spring/index.tsx)

## Stack

- Next.js
- Tailwind
- MDX
- React Spring
