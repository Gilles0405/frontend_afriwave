import { publicProxy } from "@/lib/server/public-proxy";

export async function GET(request: Request) {
  return publicProxy(request, "/api/radio");
}