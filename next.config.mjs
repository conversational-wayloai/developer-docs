import { createMDX } from 'fumadocs-mdx/next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: true,
};

// A static export has no rewrites, so the build copies each page's Markdown to /<page>.md
// (scripts/md-pages.mjs). The dev server runs without `output: 'export'`, whose checks match the
// requested URL rather than the rewritten one, and maps the URL itself.
const devConfig = {
  ...config,
  output: undefined,
  rewrites: async () => [{ source: '/:path*.md', destination: '/llms.mdx/docs/:path*/content.md' }],
};

export default function nextConfig(phase) {
  return withMDX(phase === PHASE_DEVELOPMENT_SERVER ? devConfig : config);
}
