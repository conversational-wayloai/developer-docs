import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { basePath } from '~/config/env';
import { appName, description } from '~/config/site';

import Providers from './providers';

export const metadata: Metadata = {
  title: { default: appName, template: `%s · ${appName}` },
  description,
  icons: { icon: `${basePath}/brand/favicon.png` },
};

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html className={inter.className} lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
