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
mkdir -p scripts/api
mv "$tmp/openapi.json" scripts/api/
echo "synced openapi.json from $API_REF"
