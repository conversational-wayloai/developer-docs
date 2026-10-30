import { createElement } from 'react';
import type { Icon } from '@phosphor-icons/react';
import * as phosphorIcons from '@phosphor-icons/react/ssr';
import { loader } from 'fumadocs-core/source';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { defineDocs } from 'fumadocs-mdx/macro';

import { documentationRoute } from '~/modules/urls';

const icons = phosphorIcons as unknown as Record<string, Icon | undefined>;

// Page and folder `icon` names are Phosphor icon names, matching the application's icon set.
// Phosphor exports each icon as `<Name>Icon`; the bare names are deprecated aliases.
function phosphorIcon(name: string | undefined) {
  if (!name) return undefined;

  const Icon = icons[`${name}Icon`];

  if (!Icon) throw new Error(`Unknown Phosphor icon "${name}" in content/docs`);

  return createElement(Icon);
}

const documentation = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: { headingIds: false, output: 'function' },
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const source = loader({
  baseUrl: documentationRoute,
  source: documentation.toFumadocsSource(),
  icon: phosphorIcon,
});
