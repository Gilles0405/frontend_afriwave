
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/server/auth";

type ProxyMethod = "GET" | "POST" | "PATCH" | "DELETE";
type PodcastAction = "publish" | "archive";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PODCASTS_API_PATH = "/api/podcasts";

export async function forwardRadioPodcastRequest(
  request: Request,
  radioId: string,
  method: ProxyMethod,
  podcastId?: string,
  action?: PodcastAction,
) {
  try {
    if (!API_URL) {
      return Response.json(
        { success: false, message: "Configuration API manquante." },
        { status: 500 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return Response.json(
        { success: false, message: "Authentification requise." },
        { status: 401 },
      );
    }

    const incomingUrl = new URL(request.url);
    const path = [
      PODCASTS_API_PATH.replace(/\/$/, ""),
      encodeURIComponent(radioId),
      ...(podcastId ? [encodeURIComponent(podcastId)] : []),
      ...(action ? [action] : []),
    ].join("/");

    const targetUrl = new URL(path, API_URL);
    targetUrl.search = incomingUrl.search;

    const headers = new Headers({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    });

    let body: ArrayBuffer | undefined;

    if (method !== "GET" && method !== "DELETE") {
      const contentType = request.headers.get("content-type");
      if (contentType) headers.set("Content-Type", contentType);
      body = await request.arrayBuffer();
    }

    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(120000),
    });

    const responseBody = await upstream.text();
    const responseHeaders = new Headers();
    const contentType = upstream.headers.get("content-type");

    if (contentType) {
      responseHeaders.set("Content-Type", contentType);
    }

    if (!upstream.ok) {
      console.error("[RadioPodcastProxy] Backend error:", {
        status: upstream.status,
        body: responseBody.slice(0, 1500),
      });
    }

    return new Response(responseBody, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[RadioPodcastProxy] Exception:", error);

    return Response.json(
      {
        success: false,
        message: "Erreur du proxy des podcasts.",
        ...(process.env.NODE_ENV !== "production" && {
          details: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 },
    );
  }
}
