import { forwardRadioShowRequest } from "@/lib/server/radio-show-proxy";


type Context = {
  params: Promise<{ radioId: string }>;
};

export async function GET(request: Request, { params }: Context) {
  const { radioId } = await params;
  return forwardRadioShowRequest(request, radioId, "GET");
}

export async function POST(request: Request, { params }: Context) {
  const { radioId } = await params;
  return forwardRadioShowRequest(request, radioId, "POST");
}
