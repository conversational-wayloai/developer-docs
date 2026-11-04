# Waylo developer docs

Source for the Waylo Voice developer docs at https://docs.staging.app.waylovoice.ai: what Waylo Voice is, and the Web SDK (`@waylovoice/client`). Built with [Fumadocs](https://fumadocs.dev) and exported as static pages.

## Run locally

```sh
pnpm install
cp .env.example .env     # optional, see the file for each variable
pnpm dev                 # http://localhost:3000
```

Run `pnpm validate` (lint + typecheck) before pushing. The pre-commit hook runs the typecheck and formats staged files.

## Layout

- `src/app/`: routes, root layout and providers.
- `src/components/`: React components.
- `src/config/`: constants (site metadata, layout options).
- `src/modules/`: functions (content source, URLs, llms/Markdown output, MDX components).
- `content/docs/`: the pages, in MDX. Order and titles come from each folder's `meta.json`.
- `scripts/`: build and sync scripts. `scripts/sdk/` holds the typedoc config for the SDK reference.

To build and serve the static export: `pnpm preview`.

For AI tools, `/llms.txt` lists every page, `/llms-full.txt` has them all in one file, and each page is also plain Markdown at `/<page>.md` (copied there by `scripts/md-pages.mjs` after `next build`).

## Sync the SDK docs

The Web SDK API reference (`content/docs/web-sdk/api/`) and `public/sdk/llms.txt` are generated from the SDK and committed, so the site builds without the SDK repo. To refresh them from a local checkout of `client-sdk-web`:

```sh
SDK_REPO=../client-sdk-web pnpm sync:sdk   # SDK_REF=<branch or tag> to pick a ref, default HEAD
```

`SDK_REPO` and `SDK_REF` can also be set in `.env`; shell values take precedence.

The script copies the SDK sources into `scripts/sdk/src` (not committed), runs typedoc there and rewrites the pages for Fumadocs. It also points the SDK's `llms.txt` links at these docs, since the SDK repo is private. Commit the changed files.

## Deploy

`.github/workflows/deploy.yml` builds the site, syncs `out/` to the environment's S3 bucket and invalidates its CloudFront distribution. Each run lints and typechecks first. Runs for the same environment go one at a time, in push order.

A push to `main` deploys to poc.

Cut a release candidate (→ staging):

```sh
git fetch origin
git tag v0.2.0-rc.1 origin/main
git push origin v0.2.0-rc.1
```

A final tag (`vX.Y.Z`) fails the run until the prod environment exists. Any other `v*` tag also fails.

Each GitHub environment (`poc`, `staging`) sets `DEPLOY_ROLE_ARN`, `DOCS_BUCKET`, `DOCS_DISTRIBUTION_ID`, `API_URL` and `DOCS_URL`.

The git tag is the release version. The `version` field in `package.json` does not track releases.
