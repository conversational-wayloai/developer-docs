import { documentationLlms } from '~/modules/llms';

export const revalidate = false;

export async function GET() {
  return new Response(await documentationLlms.full());
}
