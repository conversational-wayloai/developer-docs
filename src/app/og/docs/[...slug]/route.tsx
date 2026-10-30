import { generateOGImage } from 'fumadocs-ui/og';
import { notFound } from 'next/navigation';

import { appName } from '~/config/site';
import { source } from '~/modules/source';
import { imageUrl } from '~/modules/urls';

export const revalidate = false;

export function generateStaticParams() {
  return source.getPages().map(page => ({
    slug: imageUrl(page).segments,
  }));
}

export async function GET(_request: Request, { params }: RouteContext<'/og/docs/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));

  if (!page) notFound();

  return generateOGImage({
    title: page.data.title,
    description: page.data.description,
    site: appName,
  });
}
