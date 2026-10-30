import config from '@gilbarbara/eslint-config';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  {
    ignores: ['.next/**', '.source/**', 'out/**', 'next-env.d.ts', 'scripts/sdk/src/**'],
  },
  ...config,
  nextPlugin.configs['core-web-vitals'],
  {
    // App Router files must export metadata, generateStaticParams and friends alongside the
    // component. Fast refresh handles them; the rule cannot tell them from arbitrary exports.
    files: ['src/app/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
];
