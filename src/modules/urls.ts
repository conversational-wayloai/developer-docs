import { createGetUrl } from 'fumadocs-core/source';

import { basePath } from '~/config/env';

export const documentationRoute = '/docs';
export const documentationImageRoute = '/og/docs';

const getImageUrl = createGetUrl(documentationImageRoute);

export function contentSegments(page: { slugs: string[] }) {
  return [...page.slugs, 'content.md'];
}

export function imageUrl(page: { locale?: string; slugs: string[] }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}

export function markdownPath(url: string) {
  return `${url}.md`;
}

export function withBasePath(markdown: string) {
  return markdown.replaceAll('](/', `](${basePath}/`);
}
