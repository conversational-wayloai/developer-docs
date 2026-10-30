#!/usr/bin/env bash
# Copies the public OpenAPI document from a local application checkout.
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

: "${API_REPO:?set API_REPO to a local clone of application}"
API_REF="${API_REF:-HEAD}"
tmp="$(mktemp -d)"
trap "rm -rf \"$tmp\"" EXIT
git -C "$API_REPO" show "$API_REF:packages/api/openapi.json" > "$tmp/openapi.json"
# The MCP server's tools are the key-callable operations, minus file transfer, plus a person's
# reads; the MCP tools page reads both lists.
git -C "$API_REPO" show "$API_REF:packages/api/src/modules/mcp/mcp-tools.service.ts" | node -e '
const source = require("node:fs").readFileSync(0, "utf8");
const list = name => {
  const body = source.match(new RegExp(`const ${name} = new Set\\(\\[([^\\]]*)\\]`))?.[1];
  if (body === undefined) throw new Error(`mcp-tools.service.ts no longer declares ${name} as expected`);
  return [...body.matchAll(/["\x27]([A-Za-z]+)["\x27]/g)].map(match => match[1]);
};
const lists = { personReads: list("PERSON_READS"), fileTransfer: list("FILE_TRANSFER") };
process.stdout.write(JSON.stringify(lists, null, 2) + "\n");
' > "$tmp/mcp-tools.json"
# Both files or neither, so the spec and the tool lists always come from one ref.
mkdir -p scripts/api
rm -f scripts/api/mcp-excluded.json
mv "$tmp/openapi.json" "$tmp/mcp-tools.json" scripts/api/
echo "synced openapi.json and mcp-tools.json from $API_REF"
