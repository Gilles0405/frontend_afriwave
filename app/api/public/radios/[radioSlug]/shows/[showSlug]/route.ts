
import { publicProxy } from "@/lib/server/public-proxy";

type RouteContext = {
  params: Promise<{
    radioSlug: string;
    showSlug: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext,
) {
  const { radioSlug, showSlug } = await params;

  return publicProxy(
    request,
    `/api/public/radios/${encodeURIComponent(radioSlug)}/shows/${encodeURIComponent(showSlug)}`,
  );
}
