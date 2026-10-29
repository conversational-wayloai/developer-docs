import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import { Callout, Card, Cards, Mermaid, Step, Steps } from '~/components/MdxComponents';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Callout,
    Card,
    Cards,
    Mermaid,
    Step,
    Steps,
    ...components,
  } satisfies MDXComponents;
}
