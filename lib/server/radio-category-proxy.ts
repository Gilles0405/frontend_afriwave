
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/server/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

type CategoryMethod = "GET" | "POST" | "PATCH" | "DELETE";

export async function forwardRadioCategoryRequest(
  request: NextRequest,
  radioId: string,
  categoryId: string | undefined,
  method: CategoryMethod,
) {
  if (
    !/^\d+$/.test(radioId) ||
    Number(radioId) < 1 ||
    (categoryId !== undefined &&
      (!/^\d+$/.test(categoryId) || Number(categoryId) < 1))
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
  const path = categoryId
    ? `${radioId}/${categoryId}`
    : radioId;

  const url = `${API_URL}/api/radio-categories/${path}${
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
          {
            success: false,
            message: "Le format doit être JSON.",
          },
          { status: 415 },
        );
      }

      // Transmettre le corps pour POST ET PATCH.
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
    console.error("[Radio Category Proxy]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Impossible de joindre le serveur API.",
      },
      { status: 502 },
    );
  }
}
