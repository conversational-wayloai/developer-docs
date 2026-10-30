import { documentationLlms } from '~/modules/llms';
import { withBasePath } from '~/modules/urls';

export const revalidate = false;

export async function GET() {
  return new Response(withBasePath(await documentationLlms.full()));
}
