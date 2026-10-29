import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import { Callout, Card, Cards, Mermaid, StageCard, Step, Steps } from '~/components/MdxComponents';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Callout,
    Card,
    Cards,
    Mermaid,
    StageCard,
    Step,
    Steps,
    ...components,
  } satisfies MDXComponents;
}
