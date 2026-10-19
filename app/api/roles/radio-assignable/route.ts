import { forwardRadioUserRequest } from "@/lib/server/radio-users-proxy";


export async function GET(request: Request) {
  return forwardRadioUserRequest(
    request,
    "/api/roles/radio-assignable",
    "GET"
  );
}