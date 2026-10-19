
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/server/auth";

type ProxyMethod = "GET" | "POST" | "PATCH" | "DELETE";
type ShowAction = "publish" | "archive" | "upload-image";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SHOWS_API_PATH = "/api/shows";

export async function forwardRadioShowRequest(
  request: Request,
  radioId: string,
  method: ProxyMethod,
  showId?: string,
  action?: ShowAction,
) {
  try {
    if (!API_URL) {
      throw new Error("NEXT_PUBLIC_API_URL est absente.");
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return Response.json(
        { success: false, message: "Session absente ou expirée." },
        { status: 401 },
      );
    }

    const incomingUrl = new URL(request.url);

    const path = [
      SHOWS_API_PATH.replace(/\/$/, ""),
      encodeURIComponent(radioId),
      ...(showId ? [encodeURIComponent(showId)] : []),
      ...(action ? [action] : []),
    ].join("/");

    const baseUrl = API_URL.endsWith("/")
      ? API_URL
      : `${API_URL}/`;

    const targetUrl = new URL(path.replace(/^\//, ""), baseUrl);
    targetUrl.search = incomingUrl.search;

    const headers = new Headers({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    });

    let body: ArrayBuffer | undefined;

    if (method !== "GET" && method !== "DELETE") {
      const contentType = request.headers.get("content-type");

      if (contentType) {
        headers.set("Content-Type", contentType);
      }

      body = await request.arrayBuffer();
    }

    console.info("[RadioShowProxy] Appel backend", {
      method,
      url: targetUrl.toString(),
    });

    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    const responseBody = await upstream.text();

    console.info("[RadioShowProxy] Réponse backend", {
      status: upstream.status,
      contentType: upstream.headers.get("content-type"),
    });

    if (!upstream.ok) {
      console.error("[RadioShowProxy] Backend en erreur", {
        status: upstream.status,
        body: responseBody.slice(0, 1500),
      });
    }

    const responseHeaders = new Headers();
    const contentType = upstream.headers.get("content-type");

    if (contentType) {
      responseHeaders.set("Content-Type", contentType);
    }

    return new Response(responseBody, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const details =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);

    console.error("[RadioShowProxy] Exception détaillée :", details, error);

    return Response.json(
      {
        success: false,
        message: "Erreur du proxy des émissions.",
        ...(process.env.NODE_ENV !== "production" && { details }),
      },
      { status: 500 },
    );
  }
}
