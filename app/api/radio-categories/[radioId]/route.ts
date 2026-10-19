
import { forwardRadioCategoryRequest } from "@/lib/server/radio-category-proxy";
import { NextRequest } from "next/server";


type RouteContext = {
  params: Promise<{ radioId: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const { radioId } = await context.params;

  return forwardRadioCategoryRequest(
    request,
    radioId,
    undefined,
    "GET",
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const { radioId } = await context.params;

  return forwardRadioCategoryRequest(
    request,
    radioId,
    undefined,
    "POST",
  );
}
