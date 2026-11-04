// Copies each page's Markdown from out/llms.mdx/docs/<slug>/content.md to out/<slug>.md.
import { cpSync, globSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const from = 'out/llms.mdx/docs';
// Pages share the site root with these routes and public files; a matching slug would overwrite one.
const reserved = [
  'api/search',
  'brand',
  'llms',
  'llms-full',
  'llms-full.txt',
  'llms.mdx',
  'llms.txt',
  'og',
  'sdk',
];
const collisions = [];

for (const file of globSync('**/content.md', { cwd: from })) {
  const slug = dirname(file);

  if (slug === '.') continue;
  if (reserved.some(path => slug === path || slug.startsWith(`${path}/`))) collisions.push(slug);
  cpSync(join(from, file), join('out', `${slug}.md`));
}

if (collisions.length > 0) {
  throw new Error(`Pages collide with reserved routes: ${collisions.join(', ')}`);
}

// public/ is copied as-is, so the SDK llms.txt gets its docs host here.
const documentationUrl = process.env.DOCS_URL?.replace(/\/+$/, '');

if (!documentationUrl) {
  throw new Error('DOCS_URL is not set; sdk/llms.txt needs it. See .env.example.');
}

const sdkLlms = 'out/sdk/llms.txt';

writeFileSync(sdkLlms, readFileSync(sdkLlms, 'utf8').replaceAll('{{DOCS_URL}}', documentationUrl));

// A placeholder left in the output means a page used it outside code, where remark-api-url can't reach.
const placeholders = ['{{API_URL}}', '{{DOCS_URL}}'];
const leftovers = globSync('**/*.{html,md,txt}', { cwd: 'out' }).filter(file => {
  const text = readFileSync(join('out', file), 'utf8');

  return placeholders.some(placeholder => text.includes(placeholder));
});

if (leftovers.length > 0) {
  throw new Error(`${placeholders.join(' or ')} left unreplaced in: ${leftovers.join(', ')}`);
}
