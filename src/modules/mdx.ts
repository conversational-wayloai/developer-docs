import { Step, Steps } from 'fumadocs-ui/components/steps';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import Mermaid from '~/components/Mermaid';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Step,
    Steps,
    Mermaid,
    ...components,
  } satisfies MDXComponents;
}
