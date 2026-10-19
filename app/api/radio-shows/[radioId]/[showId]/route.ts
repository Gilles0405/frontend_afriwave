
import { forwardRadioShowRequest } from "@/lib/server/radio-show-proxy";

type Context = {
  params: Promise<{ radioId: string; showId: string }>;
};

export async function GET(request: Request, { params }: Context) {
  const { radioId, showId } = await params;
  return forwardRadioShowRequest(request, radioId, "GET", showId);
}

export async function PATCH(request: Request, { params }: Context) {
  const { radioId, showId } = await params;
  return forwardRadioShowRequest(request, radioId, "PATCH", showId);
}

export async function DELETE(request: Request, { params }: Context) {
  const { radioId, showId } = await params;
  return forwardRadioShowRequest(request, radioId, "DELETE", showId);
}
