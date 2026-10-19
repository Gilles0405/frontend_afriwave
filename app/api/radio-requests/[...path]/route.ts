
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const allowedRoutes = [
  { pattern: /^create$/, methods: ["POST"] },
  { pattern: /^detail\/\d+$/, methods: ["GET"] },
  { pattern: /^\d+\/approve$/, methods: ["PATCH"] },
  { pattern: /^\d+\/reject$/, methods: ["PATCH"] },
];

async function proxy(
  request: NextRequest,
  context: RouteContext,
) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (!apiBase) {
    return NextResponse.json(
      { success: false, message: "URL du backend non configurée" },
      { status: 500 },
    );
  }

  const { path } = await context.params;
  const routePath = path.join("/");

  const allowedRoute = allowedRoutes.find(({ pattern }) =>
    pattern.test(routePath),
  );

  if (!allowedRoute) {
    return NextResponse.json(
      { success: false, message: "Route non autorisée" },
      { status: 404 },
    );
  }

  const method = request.method;

  if (!allowedRoute.methods.includes(method)) {
    return NextResponse.json(
      { success: false, message: "Méthode non autorisée" },
      { status: 405 },
    );
  }

  const token = request.cookies.get("afriwave_session")?.value;
  try {
    const body =
      method === "GET" ? undefined : await request.text();

    const response = await fetch(
      `${apiBase}/api/radio-requests/${routePath}`,
      {
        method,
        headers: {
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
        body: body || undefined,
        cache: "no-store",
      },
    );

    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy radio-requests detail/action :", error);

    return NextResponse.json(
      { success: false, message: "Backend Express inaccessible" },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  return proxy(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  return proxy(request, context);
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  return proxy(request, context);
}
