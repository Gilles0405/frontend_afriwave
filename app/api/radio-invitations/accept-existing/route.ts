import { forwardRadioUserRequest } from "@/lib/server/radio-users-proxy";


export async function POST(request: Request) {
  return forwardRadioUserRequest(
    request,
    "/api/radio/radio-invitations/accept-existing",
    "POST"
  );
}
