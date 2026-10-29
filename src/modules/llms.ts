import type { Folder, Node } from 'fumadocs-core/page-tree';
import { llms } from 'fumadocs-core/source';

import { getMDXComponents } from '~/modules/mdx';
import { source } from '~/modules/source';
import { markdownPath } from '~/modules/urls';

type Page = NonNullable<ReturnType<typeof source.getPage>>;

// Docs links point at the Markdown copies, so an agent reading one page can follow the rest.
function cleanMarkdown(text: string) {
  return text
    .replace(/\\([{}])/g, '$1')
    .replace(
      /\]\((\/docs\/[^)#\s]*)(#[^)\s]*)?\)/g,
      (_, path: string, hash = '') => `](${markdownPath(path)}${hash})`,
    )
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function pageMarkdown(page: Page) {
  const description = page.data.description ? `> ${page.data.description}\n\n` : '';

  return `# ${page.data.title}\n\n${description}${cleanMarkdown(
    await page.data.getText('processed', { components: getMDXComponents() }),
  )}\n`;
}

export const documentationLlms = llms(source, { renderPage: pageMarkdown });

function indexLines(nodes: Node[], depth: number): string[] {
  return nodes.flatMap(node => {
    if (node.type === 'separator') return [];
    if (node.type === 'page') return [pageLine(node.url, node.name)];

    const folder = node as Folder;
    const heading = `${'#'.repeat(Math.min(depth, 4))} ${String(folder.name)}`;
    const index = folder.index ? [pageLine(folder.index.url, folder.index.name)] : [];

    return ['', heading, '', ...index, ...indexLines(folder.children, depth + 1)];
  });
}

function pageLine(url: string, name: unknown) {
  const page = source.getPages().find(candidate => candidate.url === url);
  const description = page?.data.description ? `: ${page.data.description}` : '';

  return `- [${String(name)}](${markdownPath(url)})${description}`;
}

export function llmsIndex() {
  return [
    '# Waylo developer docs',
    '',
    '> Waylo Voice is a voice agent platform. These docs cover adding a talking agent to your website: the page uses the Web SDK (`@waylovoice/client`); your server creates the call session with your Waylo API key.',
    '',
    '- [Web SDK llms.txt](/sdk/llms.txt): the whole Web SDK in one file. Start here.',
    '- [Full docs](/llms-full.txt): every page below in one file.',
    ...indexLines(source.getPageTree().children, 2),
    '',
  ].join('\n');
}
