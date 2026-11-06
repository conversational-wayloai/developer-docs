import { readFileSync } from 'node:fs';

import { keyCallable, type Operation, readSpec } from '~/modules/openapi';

const LISTS = './scripts/api/mcp-tools.json';

export interface McpTool {
  access: string;
  name: string;
  resource: string;
  /** The scopes an API key needs; null for a tool only a person who signed in gets. */
  scopes: string[] | null;
  summary: string;
}

/**
 * The MCP server's tools, by the rule in `mcp-tools.service.ts`: every operation a key may call,
 * minus file transfer and key management, plus the tools only a person has.
 */
export function mcpTools(): McpTool[] {
  const { fileTransfer, keyManagement, personTools } = JSON.parse(readFileSync(LISTS, 'utf8')) as {
    fileTransfer: string[];
    keyManagement: string[];
    personTools: string[];
  };

  // `pnpm sync:api` writes all three lists; a missing one means a stale or hand-edited file.
  for (const [key, list] of Object.entries({ fileTransfer, keyManagement, personTools })) {
    if (!Array.isArray(list))
      throw new TypeError(`${LISTS} has no "${key}" list. Run pnpm sync:api.`);
  }

  const tools: McpTool[] = [];

  for (const item of Object.values(readSpec().paths)) {
    for (const operation of Object.values(item) as Operation[]) {
      const name = operation.operationId;

      if (!name || fileTransfer.includes(name) || keyManagement.includes(name)) continue;
      if (!keyCallable(operation) && !personTools.includes(name)) continue;

      tools.push({
        access: operation.description?.match(/\*\*Access:\*\*\s*([^·\n]+)/)?.[1]?.trim() ?? '',
        name,
        resource: operation.tags?.[0] ?? '',
        scopes: keyCallable(operation) ? operation['x-api-scopes']! : null,
        summary: operation.summary ?? '',
      });
    }
  }

  return tools.sort((a, b) => a.resource.localeCompare(b.resource) || a.name.localeCompare(b.name));
}
