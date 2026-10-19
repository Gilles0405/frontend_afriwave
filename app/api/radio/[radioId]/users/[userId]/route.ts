import { forwardRadioUserRequest } from "@/lib/server/radio-users-proxy";


type Context = {
  params: Promise<{
    radioId: string;
    userId: string;
  }>;
};

export async function PATCH(request: Request, context: Context) {
  const { radioId, userId } = await context.params;

  if (
    !/^\d+$/.test(radioId) ||
    !/^\d+$/.test(userId) ||
    Number(radioId) < 1 ||
    Number(userId) < 1
  ) {
    return Response.json(
      { success: false, message: "Identifiants invalides." },
      { status: 400 }
    );
  }

  return forwardRadioUserRequest(
    request,
    `/api/radio/${encodeURIComponent(radioId)}/users/${encodeURIComponent(userId)}`,
    "PATCH"
  );
}

export async function DELETE(request: Request, context: Context) {
  const { radioId, userId } = await context.params;

  if (
    !/^\d+$/.test(radioId) ||
    !/^\d+$/.test(userId) ||
    Number(radioId) < 1 ||
    Number(userId) < 1
  ) {
    return Response.json(
      { success: false, message: "Identifiants invalides." },
      { status: 400 }
    );
  }

  return forwardRadioUserRequest(
    request,
    `/api/radio/${encodeURIComponent(radioId)}/users/${encodeURIComponent(userId)}`,
    "DELETE"
  );
}
