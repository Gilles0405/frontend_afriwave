
import { forwardRadioPodcastRequest } from "@/lib/server/radio-podcast-proxy";

type Context = {
  params: Promise<{ radioId: string; podcastId: string }>;
};

export async function POST(request: Request, { params }: Context) {
  const { radioId, podcastId } = await params;
  return forwardRadioPodcastRequest(
    request, radioId, "POST", podcastId, "publish"
  );
}
