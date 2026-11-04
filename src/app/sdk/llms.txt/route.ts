import { readFileSync } from 'node:fs';

import { documentationUrl } from '~/modules/urls';

// A route, not a public file, so dev and the export both fill in the docs host.
const SOURCE = './scripts/sdk/llms.txt';

export const revalidate = false;

export function GET() {
  const text = readFileSync(SOURCE, 'utf8').replaceAll(
    '{{DOCS_URL}}',
    documentationUrl('sdk/llms.txt'),
  );

  return new Response(text);
}
