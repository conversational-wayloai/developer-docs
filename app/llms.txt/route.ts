import { llmsIndex } from '@/lib/source';
import { withBasePath } from '@/lib/shared';

export const revalidate = false;

export function GET() {
  return new Response(withBasePath(llmsIndex()));
}
