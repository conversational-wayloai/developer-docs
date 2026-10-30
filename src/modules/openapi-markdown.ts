type Schema = Record<string, unknown>;

interface Document {
  paths?: Record<string, Record<string, Operation>>;
  servers?: { url: string }[];
}

interface Operation {
  description?: string;
  parameters?: (Parameter | { $ref: string })[];
  requestBody?: { content?: Record<string, { schema?: Schema }>; required?: boolean };
  responses?: Record<
    string,
    { content?: Record<string, { schema?: Schema }>; description?: string }
  >;
  summary?: string;
}

interface Parameter {
  description?: string;
  in: string;
  name: string;
  required?: boolean;
  schema?: Schema;
}

// Deep enough for every schema the API publishes; a cycle stops here instead of recursing forever.
const MAX_DEPTH = 8;

function cell(text: unknown) {
  return String(text ?? '')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\|/g, '\\|');
}

function jsonBlock(value: unknown) {
  return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

function resolve(document: unknown, value: unknown, depth = 0): unknown {
  if (Array.isArray(value)) return value.map(item => resolve(document, item, depth));
  if (!value || typeof value !== 'object') return value;

  const ref = (value as { $ref?: unknown }).$ref;

  if (typeof ref === 'string') {
    if (depth >= MAX_DEPTH) return { $ref: ref };

    const target = ref
      .replace(/^#\//, '')
      .split('/')
      .reduce<unknown>(
        (node, key) => (node as Record<string, unknown> | undefined)?.[key],
        document,
      );

    return resolve(document, target, depth + 1);
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, resolve(document, item, depth)]),
  );
}

function schemaType(schema: Schema | undefined) {
  if (!schema) return '';

  const format = typeof schema.format === 'string' ? ` (${schema.format})` : '';

  if (Array.isArray(schema.enum)) return schema.enum.map(String).join(' \\| ');

  return `${String(schema.type ?? 'object')}${format}`;
}

/** One operation as Markdown: what the HTML reference shows, for the .md and llms output. */
export function operationMarkdown(document: Document, path: string, method: string) {
  const raw = document.paths?.[path]?.[method];

  if (!raw) return '';

  const operation = resolve(document, raw) as Operation;
  const server = document.servers?.[0]?.url ?? '';
  // The description is the page's, already shown above the body.
  const lines = [`\`${method.toUpperCase()} ${server}${path}\``, ''];

  lines.push('Send your API key as `Authorization: Bearer <API key>`.', '');

  // The Authorization header is said once above, not again as a parameter.
  const parameters = ((operation.parameters ?? []) as Parameter[]).filter(
    parameter => !(parameter.in === 'header' && parameter.name === 'Authorization'),
  );

  if (parameters.length > 0) {
    lines.push(
      '## Parameters',
      '',
      '| Name | In | Type | Required | Description |',
      '| --- | --- | --- | --- | --- |',
      ...parameters.map(
        parameter =>
          `| \`${parameter.name}\` | ${parameter.in} | ${cell(schemaType(parameter.schema))} | ${parameter.required ? 'yes' : 'no'} | ${cell(parameter.description)} |`,
      ),
      '',
    );
  }

  const body = operation.requestBody?.content;

  if (body) {
    for (const [type, { schema }] of Object.entries(body)) {
      lines.push(`## Request body (\`${type}\`)`, '', jsonBlock(schema), '');
    }
  }

  for (const [status, response] of Object.entries(operation.responses ?? {})) {
    lines.push(`## Response ${status}`, '');

    if (response.description) lines.push(response.description.trim(), '');

    for (const [type, { schema }] of Object.entries(response.content ?? {})) {
      if (schema) lines.push(`\`${type}\``, '', jsonBlock(schema), '');
    }
  }

  return lines.join('\n');
}
