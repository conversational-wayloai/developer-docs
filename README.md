# Waylo developer docs

Source for the Waylo developer docs at https://conversational-wayloai.github.io/developer-docs/: Get started and the Web SDK (`@waylovoice/client`). Built with [Fumadocs](https://fumadocs.dev) and exported as static pages.

## Run locally

```sh
pnpm install
pnpm dev                 # http://localhost:3000/developer-docs
```

The site builds for the `/developer-docs` path. To preview the static build at the root instead: `BASE_PATH= pnpm build && pnpm start`.

For AI tools, `/llms.txt` lists every page, `/llms-full.txt` has them all in one file, and each page is also plain Markdown at `/docs/<page>.md` (copied there by `scripts/md-pages.mjs` after `next build`).

## Sync the SDK docs

The Web SDK API reference (`content/docs/web-sdk/api/`) and `public/sdk/llms.txt` are generated from the SDK and committed, so the site builds without the SDK repo. To refresh them from a local checkout of `client-sdk-web`:

```sh
SDK_REPO=../client-sdk-web pnpm sync:sdk   # SDK_REF=<branch or tag> to pick a ref, default HEAD
```

The script copies the SDK sources into `sdk/src` (not committed), runs typedoc there and rewrites the pages for Fumadocs. It also points the SDK's `llms.txt` links at these docs, since the SDK repo is private. Commit the changed files.

## Deploy

Every push to `main` builds the site and publishes `out/` to GitHub Pages (`.github/workflows/pages.yml`).
