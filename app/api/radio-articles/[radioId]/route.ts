
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/server/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

type RouteContext = {
  params: Promise<{ radioId: string }>;
};

async function forwardRequest(
  request: NextRequest,
  radioId: string,
  method: "GET" | "POST" | "PATCH",
) {
  if (!/^\d+$/.test(radioId) || Number(radioId) < 1) {
    return NextResponse.json(
      { success: false, message: "Identifiant de radio invalide." },
      { status: 400 },
    );
  }

  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Session expirée. Veuillez vous reconnecter.",
      },
      { status: 401 },
    );
  }

  if (!API_URL) {
    return NextResponse.json(
      { success: false, message: "API backend non configurée." },
      { status: 500 },
    );
  }

  const query = request.nextUrl.searchParams.toString();
  const url = `${API_URL}/api/radio-articles/${radioId}${
    query ? `?${query}` : ""
  }`;

  try {
    const headers = new Headers({
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    });

    let body: string | undefined;

    if (method === "POST") {
      const contentType = request.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        body = await request.text();
        headers.set("Content-Type", "application/json");
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "Le format de la requête doit être JSON.",
          },
          { status: 415 },
        );
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    const responseBody = await response.json().catch(() => ({
      success: false,
      message: "Réponse invalide du serveur.",
    }));

    return NextResponse.json(responseBody, {
      status: response.status,
    });
  } catch (error) {
    console.error("[Radio Articles Proxy]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Impossible de joindre le serveur API.",
      },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const { radioId } = await context.params;
  return forwardRequest(request, radioId, "GET");
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const { radioId } = await context.params;
  return forwardRequest(request, radioId, "POST");
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const { radioId } = await context.params;
  return forwardRequest(request, radioId, "PATCH");
}
