
import { publicProxy } from "@/lib/server/public-proxy";

type Context = {
  params: Promise<{
    radioSlug: string;
    slug: string;
  }>;
};

export async function GET(request: Request, context: Context) {
  const { radioSlug, slug } = await context.params;

  return publicProxy(
    request,
    `/api/public/radios/${encodeURIComponent(radioSlug)}/articles/${encodeURIComponent(slug)}/related`,
  );
}
