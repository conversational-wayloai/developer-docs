#!/usr/bin/env bash
# Regenerates the Web SDK reference and scripts/sdk/llms.txt from a local client-sdk-web checkout.
set -euo pipefail
cd "$(dirname "$0")/.."

# Load .env without overriding variables already set in the shell.
if [ -f .env ]; then
  while IFS='=' read -r key value || [ -n "$key" ]; do
    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
    value="${value%\"}" && value="${value#\"}"
    if [ -z "${!key+x}" ]; then export "$key=$value"; fi
  done < .env
fi

: "${SDK_REPO:?set SDK_REPO to a local clone of client-sdk-web}"
SDK_REF="${SDK_REF:-HEAD}"
sdk_src=scripts/sdk/src
tmp="$(mktemp -d)"
trap "rm -rf \"$tmp\"" EXIT
git -C "$SDK_REPO" archive "$SDK_REF" packages/client/src packages/client/llms.txt | tar -x -C "$tmp"
rm -rf "$sdk_src" && mkdir -p "$sdk_src"
cp -r "$tmp/packages/client/src/." "$sdk_src/"
cp "$tmp/packages/client/llms.txt" scripts/sdk/llms.txt
# Point SDK repo links at the docs pages, so llms.txt stays inside the docs site. The /sdk/llms.txt route fills in {{DOCS_URL}}.
node - scripts/sdk/llms.txt <<'EOF'
const { readFileSync, writeFileSync } = require('node:fs');
const file = process.argv[2];
let text = readFileSync(file, 'utf8')
  .replace(/^- \[README\]\([^)]*client-sdk-web[^)]*\):/m, `- [Web SDK docs]({{DOCS_URL}}/web-sdk.md):`)
  .replace(/^- \[Example app\]\([^)]*client-sdk-web[^)]*\):/m, `- [Full example]({{DOCS_URL}}/web-sdk/full-example.md):`);
if (/client-sdk-web/.test(text)) throw new Error(`${file} still links to the SDK repo`);
writeFileSync(file, text);
EOF
rm -rf content/docs/web-sdk/api
(cd scripts/sdk && pnpm exec typedoc)
node scripts/postprocess-typedoc.mjs
if grep -rq "client-sdk-web" content/docs/web-sdk/api; then echo "generated API links to the SDK repo" >&2; exit 1; fi
echo "synced SDK docs from $SDK_REF"
