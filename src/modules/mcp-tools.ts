import { readFileSync } from 'node:fs';

import { keyCallable, type Operation, readSpec } from '~/modules/openapi';

const LISTS = './scripts/api/mcp-tools.json';

export interface McpTool {
  access: string;
  name: string;
  resource: string;
  /** The scopes an API key needs; null for a read only a person who signed in gets. */
  scopes: string[] | null;
  summary: string;
}

/**
 * The MCP server's tools, by the rule in `mcp-tools.service.ts`: every operation a key may call,
 * minus file transfer, plus the reads only a person has.
 */
export function mcpTools(): McpTool[] {
  const { fileTransfer, personReads } = JSON.parse(readFileSync(LISTS, 'utf8')) as {
    fileTransfer: string[];
    personReads: string[];
  };
  const tools: McpTool[] = [];

  for (const item of Object.values(readSpec().paths)) {
    for (const operation of Object.values(item) as Operation[]) {
      const name = operation.operationId;

      if (!name || fileTransfer.includes(name)) continue;
      if (!keyCallable(operation) && !personReads.includes(name)) continue;

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
