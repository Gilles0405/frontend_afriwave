
import { forwardRadioPodcastRequest } from "@/lib/server/radio-podcast-proxy";

type Context = {
  params: Promise<{ radioId: string }>;
};

export async function GET(request: Request, { params }: Context) {
  const { radioId } = await params;
  return forwardRadioPodcastRequest(request, radioId, "GET");
}

export async function POST(request: Request, { params }: Context) {
  const { radioId } = await params;
  return forwardRadioPodcastRequest(request, radioId, "POST");
}
