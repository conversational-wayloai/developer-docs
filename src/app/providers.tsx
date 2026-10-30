'use client';

import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';

import SearchDialog from '~/components/SearchDialog';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers(props: ProvidersProps) {
  const { children } = props;

  return <RootProvider search={{ SearchDialog }}>{children}</RootProvider>;
}
