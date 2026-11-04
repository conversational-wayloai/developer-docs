// Copies each page's Markdown from out/llms.mdx/docs/<slug>/content.md to out/<slug>.md.
import { cpSync, globSync, readFileSync } from 'node:fs';
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

// A placeholder left in the output means a page used it outside code, where remark-api-url can't reach.
const leftovers = globSync('**/*.{html,md,txt}', { cwd: 'out' }).filter(file =>
  readFileSync(join('out', file), 'utf8').includes('{{API_URL}}'),
);

if (leftovers.length > 0) {
  throw new Error(`{{API_URL}} left unreplaced in: ${leftovers.join(', ')}`);
}
