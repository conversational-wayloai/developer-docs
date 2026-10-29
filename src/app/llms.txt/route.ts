import { llmsIndex } from '~/modules/llms';
import { withBasePath } from '~/modules/urls';

export const revalidate = false;

export function GET() {
  return new Response(withBasePath(llmsIndex()));
}
