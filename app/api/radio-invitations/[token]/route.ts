import { forwardRadioUserRequest } from "@/lib/server/radio-users-proxy";


type Context = {
  params: Promise<{ token: string }>;
};

export async function GET(request: Request, context: Context) {
  const { token } = await context.params;

  if (token.length < 32 || token.length > 512) {
    return Response.json(
      { success: false, message: "Token d'invitation invalide." },
      { status: 400 }
    );
  }

  return forwardRadioUserRequest(
    request,
    `/api/radio/radio-invitations/${encodeURIComponent(token)}`,
    "GET",
    { authenticated: false }
  );
}
