import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

import { appName, githubUrl } from '~/config/site';

import Brand from '~/components/Brand';

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl,
    nav: {
      title: (
        <>
          <Brand size={24} />
          <span className="font-semibold">{appName}</span>
        </>
      ),
    },
  };
}
