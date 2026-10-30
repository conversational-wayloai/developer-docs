import { replaceSource } from 'fumadocs-core/mdx-plugins/stringifier';

const PLACEHOLDER = '{{API_URL}}';

type File = Parameters<typeof replaceSource>[0];

interface Node {
  children?: Node[];
  position?: { end: { offset?: number }; start: { offset?: number } };
  type: string;
  url?: string;
  value?: string;
}

export function apiUrl(usedIn = 'the docs') {
  const value = process.env.API_URL?.replace(/\/+$/, '');

  if (!value) throw new Error(`API_URL is not set; ${usedIn} needs it. See .env.example.`);

  return value;
}

/**
 * Replaces `{{API_URL}}` with the `API_URL` env var in code, inline code, text and link URLs.
 * Prose can't hold the placeholder as-is: MDX parses `{…}` as an expression.
 */
export function remarkApiUrl() {
  return (tree: Node, file: File) => {
    const source = String(file);
    const stack = [tree];

    while (stack.length > 0) {
      const node = stack.pop()!;
      const inValue = typeof node.value === 'string' && node.value.includes(PLACEHOLDER);
      const inUrl = typeof node.url === 'string' && node.url.includes(PLACEHOLDER);

      if (inValue || inUrl) {
        const url = apiUrl(file.path);

        if (inValue) node.value = node.value!.replaceAll(PLACEHOLDER, url);
        if (inUrl) node.url = node.url!.replaceAll(PLACEHOLDER, url);

        // The .md export is stringified from the authored source, so it needs the same edit.
        const { end, start } = node.position ?? {};

        if (start?.offset !== undefined && end?.offset !== undefined) {
          const authored = source.slice(start.offset, end.offset);

          replaceSource(file, node as never, authored.replaceAll(PLACEHOLDER, url));
        }
      }

      stack.push(...(node.children ?? []));
    }
  };
}
