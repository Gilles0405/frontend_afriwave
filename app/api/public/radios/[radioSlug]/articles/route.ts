
import { publicProxy } from "@/lib/server/public-proxy";

type Context = {
  params: Promise<{ radioSlug: string }>;
};

export async function GET(request: Request, context: Context) {
  const { radioSlug } = await context.params;

  return publicProxy(
    request,
    `/api/public/radios/${encodeURIComponent(radioSlug)}/articles`,
  );
}
