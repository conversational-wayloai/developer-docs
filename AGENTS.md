# AGENTS.md

Rules for this repository. The README covers layout, local setup, syncing, and deploys; this file covers the choices behind them.

## Tooling

- Use pnpm. Node and pnpm are pinned in `.nvmrc` and `package.json` `packageManager`; do not bump either as a side effect of another change.
- `pnpm validate` (lint, typecheck, format) before reporting a change as done. `pnpm lint` rewrites files: commit what it changed, since CI fails on any diff after it.
- Run `pnpm build` when a change touches `scripts/`, `src/modules/llms.ts`, `next.config.mjs` or the MDX components. Those break in the static export or the post-build step, not in typecheck.
- New dependencies need approval before installing.

## Content

- Pages are MDX in `content/docs/`. Each folder's `meta.json` sets the order; a page missing from `pages` is missing from the sidebar.
- Frontmatter has `title`, `description`, and `icon`. `icon` is a Phosphor icon name without the `Icon` suffix; an unknown name fails the build.
- Link pages by their route (`/api/scopes`, `/api/api-keys#create-a-key`), never by file path or `.md`. The llms output rewrites page links to the Markdown copies.
- Write the API origin as `{{API_URL}}`, inside code, inline code or a link URL. The build fills it in per environment; a placeholder left anywhere in the output fails the build. Never hard-code an API host.
- A component used as JSX in content defines its Markdown form in `src/components/MdxComponents.tsx`. Without one, the `.md` copies and llms files show raw JSX.
- The readers are external developers. Never link to or describe the private repositories (`application`, `client-sdk-web`) or internal infrastructure.
- Prettier does not format `content/`: it only supports MDX v1.

## Generated files

Never hand-edit these. Change the script that writes them, run it, and commit its output.

| Files | Written by | Source |
| --- | --- | --- |
| `content/docs/web-sdk/api/`, `scripts/sdk/llms.txt` | `pnpm sync:sdk` | `client-sdk-web` checkout (`SDK_REPO`) |
| `scripts/api/openapi.json`, `scripts/api/mcp-tools.json` | `pnpm sync:api` | `application` checkout (`API_REPO`) |

- The API reference pages are built from `scripts/api/openapi.json` at build time; there is no MDX for them beyond `content/docs/api/reference/index.mdx`.
- The MCP tools list comes from the same spec plus `mcp-tools.json`, which mirrors the rule in the application's `mcp-tools.service.ts`. The sync fails when that file stops declaring its lists as expected; fix the parser, do not hand-write the JSON.

## Build and output

- The site is a static export (`output: 'export'`) served from the root of S3 + CloudFront. There is no server: no rewrites, redirects or route handlers that run per request.
- Every page also ships as Markdown at `/<page>.md`. `scripts/md-pages.mjs` copies them after `next build`; the dev server maps the same URLs with a rewrite.
- Pages share the root with routes and public files (`llms.txt`, `sdk/`, `og/`, …). `md-pages.mjs` keeps a `reserved` list and fails the build on a colliding slug; add a new root route or public path to it.
- Links in `/llms.txt`, `/llms-full.txt`, `/sdk/llms.txt` and each `<page>.md` are absolute, built from `DOCS_URL`, so a copy pasted elsewhere still resolves.
- A file that needs an env value is served from a route handler, not `public/`: `public/` is copied as-is, in dev and in the export.

## Environment

- `.env.example` is the source of truth for every variable this repo reads. A new variable goes there, and in the README's list of environment variables when CI needs it.
- A required variable fails the build when it is missing, with a message that names it. No fallback values: a fallback ships a wrong URL silently.
- No keys, tokens, or credentials in code or commits.

## Deploys

- A push to `main` deploys to poc; a `vX.Y.Z-rc.N` tag deploys to staging. Never push to `main` or create a tag unless asked.
- The deploy syncs `.md` and `.txt` with `--delete`, so a renamed page stops serving its old copy. Moving a page breaks its old URL; check links into it.

## Commits

- Subject in the imperative, sentence case, no prefix. A body only when the why is not obvious from the subject.
- One logical change per commit.
