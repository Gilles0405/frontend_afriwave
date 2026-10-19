import { publicProxy } from "@/lib/server/public-proxy";


type RouteContext = {
  params: Promise<{
    radioSlug: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext,
) {
  const { radioSlug } = await params;

  return publicProxy(
    request,
    `/api/public/radios/${encodeURIComponent(radioSlug)}/podcasts`,
  );
}