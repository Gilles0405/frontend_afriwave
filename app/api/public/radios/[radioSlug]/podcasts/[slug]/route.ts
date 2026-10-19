
import { publicProxy } from "@/lib/server/public-proxy";


type RouteContext = {
  params: Promise<{
    radioSlug: string;
    slug: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext,
) {
  const { radioSlug, slug } = await params;

  return publicProxy(
    request,
    `/api/public/radios/${encodeURIComponent(radioSlug)}/podcasts/${encodeURIComponent(slug)}`,
  );
}