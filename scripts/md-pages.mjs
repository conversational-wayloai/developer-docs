// Copies each page's Markdown from out/llms.mdx/docs/<slug>/content.md to out/docs/<slug>.md.
import { cpSync, globSync } from 'node:fs';
import { dirname, join } from 'node:path';

const from = 'out/llms.mdx/docs';

for (const file of globSync('**/content.md', { cwd: from })) {
  const slug = dirname(file);
  if (slug === '.') continue;
  cpSync(join(from, file), join('out/docs', `${slug}.md`));
}
