import { DocsLayout } from 'fumadocs-ui/layouts/docs';

import { baseOptions } from '~/config/layout';
import { source } from '~/modules/source';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
