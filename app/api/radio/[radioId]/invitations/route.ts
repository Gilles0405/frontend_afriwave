import { forwardRadioUserRequest } from "@/lib/server/radio-users-proxy";



type Context = {
  params: Promise<{ radioId: string }>;
};

export async function POST(request: Request, context: Context) {
  const { radioId } = await context.params;

  if (!/^\d+$/.test(radioId) || Number(radioId) < 1) {
    return Response.json(
      { success: false, message: "Identifiant radio invalide." },
      { status: 400 }
    );
  }

  return forwardRadioUserRequest(
    request,
    `/api/radio/${encodeURIComponent(radioId)}/invitations`,
    "POST"
  );
}

