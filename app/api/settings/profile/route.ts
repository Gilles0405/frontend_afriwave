import { forwardRadioUserRequest } from "@/lib/server/radio-users-proxy";


export async function GET(request: Request) {
  return forwardRadioUserRequest(request, "/api/auth/me", "GET");
}

export async function PATCH(request: Request) {
  return forwardRadioUserRequest(request, "/api/auth/me", "PATCH");
}
