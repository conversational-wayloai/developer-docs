'use client';

import type { ReactNode } from 'react';
import { cn } from 'cn';
import { usePathname } from 'fumadocs-core/framework';
import type { Folder } from 'fumadocs-core/page-tree';
import {
  SidebarFolder as BaseFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  useFolderDepth,
} from 'fumadocs-ui/components/sidebar/base';
import { useTreePath } from 'fumadocs-ui/contexts/tree';

interface SidebarFolderProps {
  children: ReactNode;
  item: Folder;
}

// Mirrors the item classes of the default docs sidebar, which aren't exported.
const itemClassName =
  'relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none';

function isActive(href: string, pathname: string) {
  return trimSlash(href) === trimSlash(pathname);
}

function itemOffset(depth: number) {
  return `calc(${2 + 3 * depth} * var(--spacing))`;
}

function trimSlash(url: string) {
  return url.length > 1 && url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * Renders top-level folders as section headings and nested folders like the default sidebar.
 */
export default function SidebarFolder(props: SidebarFolderProps) {
  const { children, item } = props;
  const depth = useFolderDepth();
  const path = useTreePath();
  const pathname = usePathname();
  const isSection = depth === 0;
  const label = (
    <>
      {item.icon}
      {item.name}
    </>
  );

  return (
    <BaseFolder
      active={path.includes(item)}
      className={cn(isSection && 'mt-4 first:mt-0')}
      collapsible={item.collapsible}
      defaultOpen={item.defaultOpen}
    >
      {item.index ? (
        <SidebarFolderLink
          active={isActive(item.index.url, pathname)}
          className={cn(
            itemClassName,
            'data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary',
          )}
          external={item.index.external}
          href={item.index.url}
          style={{ paddingInlineStart: itemOffset(depth) }}
        >
          {label}
        </SidebarFolderLink>
      ) : (
        <SidebarFolderTrigger
          className={cn(
            itemClassName,
            isSection && 'text-fd-foreground font-semibold hover:text-fd-foreground',
          )}
          style={{ paddingInlineStart: itemOffset(depth) }}
        >
          {label}
        </SidebarFolderTrigger>
      )}
      <SidebarFolderContent
        className={cn(
          'relative flex flex-col gap-0.5 pt-0.5',
          isSection &&
            "before:absolute before:inset-y-1 before:inset-s-2.5 before:w-px before:bg-fd-border before:content-['']",
        )}
      >
        {children}
      </SidebarFolderContent>
    </BaseFolder>
  );
}
