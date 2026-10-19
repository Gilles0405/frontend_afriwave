import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/server/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

interface RouteContext {
  params: Promise<{
    radioId: string;
    articleId: string;
  }>;
}

export async function POST(
  _request: NextRequest,
  context: RouteContext,
) {
  const { radioId, articleId } = await context.params;

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
      { success: false, message: "Session expirée." },
      { status: 401 },
    );
  }

  if (!API_URL) {
    return NextResponse.json(
      { success: false, message: "API backend non configurée." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `${API_URL}/api/radio-articles/${radioId}/${articleId}/archive`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => ({
      success: false,
      message: "Réponse invalide du serveur.",
    }));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[Publish Article Proxy]", error);

    return NextResponse.json(
      { success: false, message: "Impossible de joindre le serveur API." },
      { status: 502 },
    );
  }
}