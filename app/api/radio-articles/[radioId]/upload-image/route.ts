
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/server/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

type RouteContext = {
  params: Promise<{ radioId: string }>;
};

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const { radioId } = await context.params;

  if (!/^\d+$/.test(radioId) || Number(radioId) < 1) {
    return NextResponse.json(
      {
        success: false,
        message: "Identifiant de radio invalide.",
      },
      { status: 400 },
    );
  }

  if (!API_URL) {
    return NextResponse.json(
      {
        success: false,
        message: "API backend non configurée.",
      },
      { status: 500 },
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

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return NextResponse.json(
        {
          success: false,
          message: "Le format de la requête doit être multipart/form-data.",
        },
        { status: 415 },
      );
    }

    const headers = new Headers({
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": contentType,
    });

    const query = request.nextUrl.searchParams.toString();

    const url = `${API_URL}/api/radio-articles/${radioId}/upload-image${
      query ? `?${query}` : ""
    }`;

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: await request.arrayBuffer(),
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
    console.error("[Radio Article Image Upload Proxy]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Impossible de joindre le serveur API.",
      },
      { status: 502 },
    );
  }
}
