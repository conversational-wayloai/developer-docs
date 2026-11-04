import { createGetUrl } from 'fumadocs-core/source';

export const documentationRoute = '/';
export const documentationImageRoute = '/og/docs';

const getImageUrl = createGetUrl(documentationImageRoute);

export function contentSegments(page: { slugs: string[] }) {
  return [...page.slugs, 'content.md'];
}

// llms files get absolute links, so a copy pasted outside the docs host still resolves.
export function documentationUrl(usedIn = 'every llms file') {
  const value = process.env.DOCS_URL?.replace(/\/+$/, '');

  if (!value) throw new Error(`DOCS_URL is not set; ${usedIn} needs it. See .env.example.`);

  return value;
}

export function imageUrl(page: { locale?: string; slugs: string[] }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}

export function markdownPath(url: string) {
  return `${url}.md`;
}
