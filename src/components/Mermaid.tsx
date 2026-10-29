'use client';

import { use, useId, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';

interface MermaidProps {
  chart: string;
}

const cache = new Map<string, Promise<unknown>>();

function cachePromise<T>(key: string, setPromise: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);

  if (cached) return cached as Promise<T>;

  const promise = setPromise();

  cache.set(key, promise);

  return promise;
}

function MermaidContent(props: MermaidProps) {
  const { chart } = props;
  const id = useId();
  const { resolvedTheme } = useTheme();
  const { default: mermaid } = use(cachePromise('mermaid', () => import('mermaid')));

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    fontFamily: 'inherit',
    themeCSS: 'margin: 1.5rem auto 0;',
    theme: resolvedTheme === 'dark' ? 'dark' : 'default',
  });

  const { bindFunctions, svg } = use(
    cachePromise(`${chart}-${resolvedTheme}`, () =>
      mermaid.render(id, chart.replaceAll('\\n', '\n')),
    ),
  );

  return (
    <div
      // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{ __html: svg }}
      ref={container => {
        if (container) bindFunctions?.(container);
      }}
    />
  );
}

export default function Mermaid(props: MermaidProps) {
  const { chart } = props;

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isClient) return null;

  return <MermaidContent chart={chart} />;
}
