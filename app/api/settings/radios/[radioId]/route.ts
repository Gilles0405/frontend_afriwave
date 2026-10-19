import { forwardRadioUserRequest } from "@/lib/server/radio-users-proxy";

type RouteContext = {
  params: Promise<{ radioId: string }>;
};

function getValidRadioId(value: string): number | null {
  const radioId = Number(value);

  if (!Number.isSafeInteger(radioId) || radioId <= 0) {
    return null;
  }

  return radioId;
}

export async function GET(
  request: Request,
  { params }: RouteContext,
) {
  const { radioId: rawRadioId } = await params;
  const radioId = getValidRadioId(rawRadioId);

  if (!radioId) {
    return Response.json(
      { success: false, message: "Invalid radio ID." },
      { status: 400 },
    );
  }

  return forwardRadioUserRequest(
    request,
    `/api/radio/${radioId}`,
    "GET",
  );
}

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  const { radioId: rawRadioId } = await params;
  const radioId = getValidRadioId(rawRadioId);

  if (!radioId) {
    return Response.json(
      { success: false, message: "Invalid radio ID." },
      { status: 400 },
    );
  }

  return forwardRadioUserRequest(
    request,
    `/api/radio/${radioId}`,
    "PATCH",
  );
}
