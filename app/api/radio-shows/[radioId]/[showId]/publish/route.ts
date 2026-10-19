
import { forwardRadioShowRequest } from "@/lib/server/radio-show-proxy";

type Context = {
  params: Promise<{ radioId: string; showId: string }>;
};

export async function POST(request: Request, { params }: Context) {
  const { radioId, showId } = await params;
  return forwardRadioShowRequest(
    request,
    radioId,
    "POST",
    showId,
    "publish",
  );
}
