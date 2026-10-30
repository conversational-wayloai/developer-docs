import { createFromSource } from 'fumadocs-core/search/server';

import { source } from '~/modules/source';

export const revalidate = false;

export const { staticGET: GET } = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});
