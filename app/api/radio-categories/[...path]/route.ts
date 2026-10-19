
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function handler(
  request: NextRequest,
  context: RouteContext
) {
  if (!API_URL) {
    return NextResponse.json(
      { message: "BACKEND_API_URL non configurée" },
      { status: 500 }
    );
  }

  try {
    const { path } = await context.params;
    const pathname = path.map(encodeURIComponent).join("/");
    const search = request.nextUrl.search;

    const response = await fetch(
      `${API_URL}/api/radio-categories/${pathname}${search}`,
      {
        method: request.method,
        headers: {
          ...(request.headers.get("content-type")
            ? {
                "Content-Type":
                  request.headers.get("content-type")!,
              }
            : {}),
          ...(request.cookies.get("afriwave_session")?.value
            ? {
                Authorization: `Bearer ${
                  request.cookies.get("afriwave_session")!.value
                }`,
              }
            : {}),
        },
        ...(request.method !== "GET" &&
        request.method !== "HEAD"
          ? { body: await request.arrayBuffer() }
          : {}),
        cache: "no-store",
      }
    );

    return new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ??
          "application/json",
      },
    });
  } catch (error) {
    console.error("[Radio Categories Proxy]", error);

    return NextResponse.json(
      { message: "Erreur de communication avec le backend" },
      { status: 502 }
    );
  }
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
