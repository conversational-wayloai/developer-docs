import Link from 'next/link';
import { basePath } from '@/lib/shared';

export default function HomePage() {
  return (
    <main className="flex flex-1 items-center justify-center p-16">
      <meta httpEquiv="refresh" content={`0;url=${basePath}/docs/get-started`} />
      <Link className="underline" href="/docs/get-started">
        Get started
      </Link>
    </main>
  );
}
