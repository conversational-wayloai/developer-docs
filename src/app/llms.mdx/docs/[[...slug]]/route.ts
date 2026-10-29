import { notFound } from 'next/navigation';

import { pageMarkdown } from '~/modules/llms';
import { source } from '~/modules/source';
import { contentSegments, withBasePath } from '~/modules/urls';

export const revalidate = false;

export function generateStaticParams() {
  return source.getPages().map(page => ({
    slug: contentSegments(page),
  }));
}

export async function GET(
  _request: Request,
  { params }: RouteContext<'/llms.mdx/docs/[[...slug]]'>,
) {
  const { slug } = await params;
  // remove the appended "content.md"
  const page = source.getPage(slug?.slice(0, -1));

  if (!page) notFound();

  return new Response(withBasePath(await pageMarkdown(page)), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}
