import { DocsLayout } from 'fumadocs-ui/layouts/docs';

import { baseOptions } from '~/config/layout';
import { source } from '~/modules/source';

import SidebarFolder from '~/components/SidebarFolder';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <DocsLayout
      sidebar={{ components: { Folder: SidebarFolder } }}
      tree={source.getPageTree()}
      {...baseOptions()}
    >
      {children}
    </DocsLayout>
  );
}
