'use client';

import { createOpenAPIPage } from 'fumadocs-openapi/ui';

// No playground: the API allows CORS only from the dashboard origin, so requests from here fail.
export const OpenAPIPage = createOpenAPIPage({ playground: { enabled: false } });
