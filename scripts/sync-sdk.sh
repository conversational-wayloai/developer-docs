#!/usr/bin/env bash
# Regenerates the Web SDK reference and public/sdk/llms.txt from a local client-sdk-web checkout.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${SDK_REPO:?set SDK_REPO to a local clone of client-sdk-web}"
SDK_REF="${SDK_REF:-HEAD}"
tmp="$(mktemp -d)"
trap "rm -rf \"$tmp\"" EXIT
git -C "$SDK_REPO" archive "$SDK_REF" packages/client/src packages/client/llms.txt | tar -x -C "$tmp"
rm -rf sdk/src && mkdir -p sdk/src public/sdk
cp -r "$tmp/packages/client/src/." sdk/src/
cp "$tmp/packages/client/llms.txt" public/sdk/llms.txt
# The SDK repo is private: point its links at the public docs instead.
node - public/sdk/llms.txt <<'EOF'
const { readFileSync, writeFileSync } = require('node:fs');
const file = process.argv[2];
const docs = 'https://conversational-wayloai.github.io/developer-docs/docs';
let text = readFileSync(file, 'utf8')
  .replace(/^- \[README\]\([^)]*client-sdk-web[^)]*\):/m, `- [Web SDK docs](${docs}/web-sdk.md):`)
  .replace(/^- \[Example app\]\([^)]*client-sdk-web[^)]*\):/m, `- [Full example](${docs}/get-started/full-example.md):`);
if (/client-sdk-web/.test(text)) throw new Error(`${file} still links to the private SDK repo`);
writeFileSync(file, text);
EOF
pnpm --dir sdk install --frozen-lockfile
rm -rf content/docs/web-sdk/api
(cd sdk && pnpm exec typedoc)
node scripts/postprocess-typedoc.mjs
if grep -rq "client-sdk-web" content/docs/web-sdk/api; then echo "generated API links to the private SDK repo" >&2; exit 1; fi
echo "synced SDK docs from $SDK_REF"
