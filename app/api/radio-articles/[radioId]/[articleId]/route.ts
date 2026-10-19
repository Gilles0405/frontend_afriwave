
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/server/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

type RouteContext = {
  params: Promise<{
    radioId: string;
    articleId: string;
  }>;
};

async function forwardRequest(
  request: NextRequest,
  radioId: string,
  articleId: string,
  method: "GET" | "POST" | "DELETE" | "PATCH",
) {
  if (
    !/^\d+$/.test(radioId) ||
    Number(radioId) < 1 ||
    !/^\d+$/.test(articleId) ||
    Number(articleId) < 1
  ) {
    return NextResponse.json(
      { success: false, message: "Identifiants invalides." },
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
  const url = `${API_URL}/api/radio-articles/${radioId}/${articleId}${
    query ? `?${query}` : ""
  }`;

  try {
    const headers = new Headers({
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    });

    let body: string | undefined;

    if (method === "POST" || method === "PATCH") {
      const contentType = request.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        return NextResponse.json(
          { success: false, message: "Le format doit être JSON." },
          { status: 415 },
        );
      }

      body = await request.text();
      headers.set("Content-Type", "application/json");
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
    console.error("[Radio Article Detail Proxy]", error);

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
  const { radioId, articleId } = await context.params;
  return forwardRequest(request, radioId, articleId, "GET");
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const { radioId, articleId } = await context.params;
  return forwardRequest(request, radioId, articleId, "POST");
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  const { radioId, articleId } = await context.params;
  return forwardRequest(request, radioId, articleId, "DELETE");
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const { radioId, articleId } = await context.params;

  return forwardRequest(request, radioId, articleId, "PATCH");
}