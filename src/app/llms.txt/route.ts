import { llmsIndex } from '~/modules/llms';

export const revalidate = false;

export function GET() {
  return new Response(llmsIndex());
}
