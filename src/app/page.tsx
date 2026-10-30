import Link from 'next/link';

import { basePath } from '~/config/env';

export default function HomePage() {
  return (
    <main className="flex flex-1 items-center justify-center p-16">
      <meta content={`0;url=${basePath}/docs/get-started`} httpEquiv="refresh" />
      <Link className="underline" href="/docs/get-started">
        Get started
      </Link>
    </main>
  );
}
