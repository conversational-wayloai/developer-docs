#!/usr/bin/env bash
# Regenerates the Web SDK reference and public/sdk/llms.txt from a local client-sdk-web checkout.
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
rm -rf "$sdk_src" && mkdir -p "$sdk_src" public/sdk
cp -r "$tmp/packages/client/src/." "$sdk_src/"
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
rm -rf content/docs/web-sdk/api
(cd scripts/sdk && pnpm exec typedoc)
node scripts/postprocess-typedoc.mjs
if grep -rq "client-sdk-web" content/docs/web-sdk/api; then echo "generated API links to the private SDK repo" >&2; exit 1; fi
echo "synced SDK docs from $SDK_REF"
