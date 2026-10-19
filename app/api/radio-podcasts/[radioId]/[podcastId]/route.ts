
import { forwardRadioPodcastRequest } from "@/lib/server/radio-podcast-proxy";

type Context = {
  params: Promise<{ radioId: string; podcastId: string }>;
};

export async function GET(request: Request, { params }: Context) {
  const { radioId, podcastId } = await params;
  return forwardRadioPodcastRequest(
    request, radioId, "GET", podcastId
  );
}

export async function PATCH(request: Request, { params }: Context) {
  const { radioId, podcastId } = await params;
  return forwardRadioPodcastRequest(
    request, radioId, "PATCH", podcastId
  );
}

export async function DELETE(request: Request, { params }: Context) {
  const { radioId, podcastId } = await params;
  return forwardRadioPodcastRequest(
    request, radioId, "DELETE", podcastId
  );
}
