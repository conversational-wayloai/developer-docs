// Copies each page's Markdown from out/llms.mdx/docs/<slug>/content.md to out/docs/<slug>.md.
import { cpSync, globSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const from = 'out/llms.mdx/docs';

for (const file of globSync('**/content.md', { cwd: from })) {
  const slug = dirname(file);

  if (slug === '.') continue;
  cpSync(join(from, file), join('out/docs', `${slug}.md`));
}

// A placeholder left in the output means a page used it outside code, where remark-api-url can't reach.
const leftovers = globSync('**/*.{html,md,txt}', { cwd: 'out' }).filter(file =>
  readFileSync(join('out', file), 'utf8').includes('{{API_URL}}'),
);

if (leftovers.length > 0) {
  throw new Error(`{{API_URL}} left unreplaced in: ${leftovers.join(', ')}`);
}
