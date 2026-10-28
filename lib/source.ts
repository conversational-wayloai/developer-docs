import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/plugins/lucide-icons';
import type { Folder, Node } from 'fumadocs-core/page-tree';
import { docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

type Page = NonNullable<ReturnType<typeof source.getPage>>;

export function markdownUrl(url: string) {
  return `${url}.md`;
}

function plainMarkdown(text: string) {
  return text
    .replace(/^(#{1,6} .*?) \[#[^\]\n]+\]$/gm, '$1')
    .replace(/<Mermaid\s+chart="([\s\S]*?)"\s*\/>/g, (_, chart: string) => '```mermaid\n' + chart.trim() + '\n```')
    .replace(/^[ \t]*<Card\s+title="([^"]+)"\s+href="([^"]+)"\s*\/>/gm, '- [$1]($2)')
    .replace(/<Callout title="([^"]+)">\s*/g, '**$1.** ')
    .replace(/^[ \t]*<\/?(Cards|Steps|Step|Callout)>[ \t]*$/gm, '')
    .replace(/<\/Callout>/g, '')
    .replace(/\\([{}])/g, '$1')
    .replace(/\]\((\/docs\/[^)#\s]*)(#[^)\s]*)?\)/g, (_, path: string, hash = '') => `](${markdownUrl(path)}${hash})`)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function pageMarkdown(page: Page) {
  const description = page.data.description ? `> ${page.data.description}\n\n` : '';

  return `# ${page.data.title}\n\n${description}${plainMarkdown(await page.data.getText('processed'))}\n`;
}

export const docsLlms = llms(source, { renderPage: pageMarkdown });

function indexLines(nodes: Node[], depth: number): string[] {
  return nodes.flatMap((node) => {
    if (node.type === 'separator') return [];
    if (node.type === 'page') return [pageLine(node.url, node.name)];

    const folder = node as Folder;
    const heading = `${'#'.repeat(Math.min(depth, 4))} ${String(folder.name)}`;
    const index = folder.index ? [pageLine(folder.index.url, folder.index.name)] : [];

    return ['', heading, '', ...index, ...indexLines(folder.children, depth + 1)];
  });
}

function pageLine(url: string, name: unknown) {
  const page = source.getPages().find((candidate) => candidate.url === url);
  const description = page?.data.description ? `: ${page.data.description}` : '';

  return `- [${String(name)}](${markdownUrl(url)})${description}`;
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
