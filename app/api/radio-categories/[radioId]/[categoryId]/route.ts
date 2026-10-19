
import { forwardRadioCategoryRequest } from "@/lib/server/radio-category-proxy";
import { NextRequest } from "next/server";


type RouteContext = {
  params: Promise<{
    radioId: string;
    categoryId: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const { radioId, categoryId } = await context.params;

  return forwardRadioCategoryRequest(
    request,
    radioId,
    categoryId,
    "GET",
  );
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const { radioId, categoryId } = await context.params;

  return forwardRadioCategoryRequest(
    request,
    radioId,
    categoryId,
    "PATCH",
  );
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  const { radioId, categoryId } = await context.params;

  return forwardRadioCategoryRequest(
    request,
    radioId,
    categoryId,
    "DELETE",
  );
}
