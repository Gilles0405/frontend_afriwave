import { publicProxy } from "@/lib/server/public-proxy";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext,
) {
  const { slug } = await params;

  return publicProxy(
    request,
    `/api/public/radios/${encodeURIComponent(slug)}`,
  );
}