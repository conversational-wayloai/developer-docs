import { readFileSync } from 'node:fs';

import { createOpenAPI } from 'fumadocs-openapi/server';

import { apiUrl } from '~/modules/remark-api-url';

export type Document = {
  components?: { securitySchemes?: Record<string, unknown> };
  paths: Record<string, Record<string, Operation>>;
  security?: unknown;
  servers?: { url: string }[];
};
export type Operation = {
  description?: string;
  operationId?: string;
  parameters?: unknown[];
  security?: unknown;
  summary?: string;
  tags?: string[];
  'x-api-scopes'?: string[];
};

const SPEC = './scripts/api/openapi.json';

const AUTHORIZATION_PARAMETER = {
  name: 'Authorization',
  in: 'header',
  required: true,
  description: 'Your API key.',
  schema: { type: 'string' },
  // The samples single-quote headers, so an env var would not expand.
  example: 'Bearer sk_waylo_...',
};

/**
 * The reference covers what an API key can call, so dashboard-only operations and the dashboard
 * JWT scheme are dropped.
 */
function referenceSpec(): Document {
  const spec = readSpec();
  const paths: Document['paths'] = {};

  for (const [path, item] of Object.entries(spec.paths)) {
    const operations = Object.entries(item).filter(([, operation]) => keyCallable(operation));

    if (operations.length === 0) continue;

    paths[path] = Object.fromEntries(
      operations.map(([method, operation]) => [
        method,
        {
          ...operation,
          // The code samples are built from parameters only and never add the security header.
          parameters: [AUTHORIZATION_PARAMETER, ...(operation.parameters ?? [])],
          security: [{ 'api-key': [] }],
        },
      ]),
    );
  }

  const { bearer: _bearer, ...securitySchemes } = spec.components?.securitySchemes ?? {};

  return {
    ...spec,
    paths,
    security: [{ 'api-key': [] }],
    servers: [{ url: apiUrl(SPEC) }],
    components: { ...spec.components, securitySchemes },
  };
}

// The application publishes the scopes it enforces as `x-api-scopes`, only on routes a key may call.
export function keyCallable(operation: Operation) {
  return (operation['x-api-scopes']?.length ?? 0) > 0;
}

/** The application's public document, as synced by `pnpm sync:api`. */
export function readSpec(): Document {
  return JSON.parse(readFileSync(SPEC, 'utf8')) as Document;
}

export const openapi = createOpenAPI({
  input: { waylo: () => referenceSpec() as never },
});
