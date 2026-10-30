import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { basePath } from '~/config/env';
import { getMDXComponents } from '~/modules/mdx';
import { source } from '~/modules/source';
import { imageUrl, markdownPath } from '~/modules/urls';

export async function generateMetadata({
  params,
}: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: basePath + imageUrl(page).url,
    },
  };
}

export async function generateStaticParams() {
  return source.generateParams();
}

export default async function Page({ params }: PageProps<'/docs/[[...slug]]'>) {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) notFound();

  const MDX = page.data.body;
  const pageMarkdownUrl = basePath + markdownPath(page.url);

  return (
    <DocsPage full={page.data.full} toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={pageMarkdownUrl} />
        <ViewOptionsPopover markdownUrl={pageMarkdownUrl} />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}
