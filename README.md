[![](docs/getting-started/gutenberg.jpg)](docs/getting-started/introduction.mdx)

# @pmndrs/docs

A static MDX documentation generator with a GitHub reusable workflow, primarily used for `pmndrs/*` projects.

> [!NOTE] > **This tool is open for everyone!** While this repo is intended for building pmndrs documentation, anyone can use it to generate their own static docs site.

## Quick Start

### For Your Project

Preview your docs without cloning this repo:

```sh
# From your project directory
npx @pmndrs/docs dev ./docs --libname="Your Library"
```

Then open http://localhost:3000

Build static docs:

```sh
npx @pmndrs/docs build ./docs --libname="Your Library" --basePath="/your-library"
```

### Install as Dependency

```sh
npm install -D @pmndrs/docs
```

Add to your `package.json`:

```json
{
  "scripts": {
    "docs:dev": "dev ./docs --libname=\"Your Library\"",
    "docs:build": "build ./docs --libname=\"Your Library\""
  }
}
```

## Full Documentation

See [docs/getting-started/introduction.mdx](docs/getting-started/introduction.mdx) for complete documentation including configuration options, theming, and advanced features.
