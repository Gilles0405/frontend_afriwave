
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/server/auth";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

// À adapter si ton routeur Express est monté sur un autre préfixe.
const RADIO_API_PREFIX = (
  process.env.RADIO_INVITATIONS_API_PREFIX ?? "/api/radios"
).replace(/\/+$/, "");

type ProxyOptions = {
  method: "GET" | "POST";
  path: string;
  body?: unknown;
  authenticated?: boolean;
};

export async function radioInvitationProxy({
  method,
  path,
  body,
  authenticated = false,
}: ProxyOptions) {
  if (!API_URL) {
    return Response.json(
      { success: false, message: "API backend non configurée." },
      { status: 500 },
    );
  }

  const headers = new Headers({
    Accept: "application/json",
  });

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "Authentification requise.",
          code: "AUTHENTICATION_REQUIRED",
        },
        { status: 401 },
      );
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(
      `${API_URL}${RADIO_API_PREFIX}${path}`,
      {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
      },
    );

    const responseBody = await response.text();

    return new Response(responseBody, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      {
        success: false,
        message: "Impossible de contacter le serveur. Réessaie plus tard.",
      },
      { status: 502 },
    );
  }
}
