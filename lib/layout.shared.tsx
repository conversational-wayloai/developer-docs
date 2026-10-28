import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, basePath } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: 'https://github.com/conversational-wayloai/developer-docs',
    nav: {
      title: (
        <>
          <img src={`${basePath}/brand/logo.svg`} alt="" width={24} height={20} />
          <span className="font-semibold">{appName}</span>
        </>
      ),
    },
  };
}
