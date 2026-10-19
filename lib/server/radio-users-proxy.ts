
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/server/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ProxyMethod = "GET" | "POST" | "PATCH" | "DELETE";

export async function forwardRadioUserRequest(
  request: Request,
  path: string,
  method: ProxyMethod,
  options: { authenticated?: boolean } = {}
) {
  try {
    if (!API_URL) {
      return Response.json(
        { success: false, message: "API_URL non configurée." },
        { status: 500 }
      );
    }

    const headers = new Headers({
      Accept: "application/json",
    });

    if (options.authenticated !== false) {
      const cookieStore = await cookies();
      const token = cookieStore.get(SESSION_COOKIE)?.value;

      if (!token) {
        return Response.json(
          { success: false, message: "Authentification requise." },
          { status: 401 }
        );
      }

      headers.set("Authorization", `Bearer ${token}`);
    }

    const incomingUrl = new URL(request.url);

    const baseUrl = API_URL.replace(/\/+$/, "");
    const normalizedPath = path.replace(/^\/+/, "");

    const apiPath = normalizedPath.startsWith("api/")
      ? normalizedPath
      : `api/${normalizedPath}`;

    const targetUrl = new URL(`${baseUrl}/${apiPath}`);
    targetUrl.search = incomingUrl.search;

    let body: ArrayBuffer | undefined;

    if (method !== "GET" && method !== "DELETE") {
      body = await request.arrayBuffer();

      const contentType = request.headers.get("content-type");
      if (contentType) {
        headers.set("Content-Type", contentType);
      }
    }

    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });

    const responseBody = await upstream.text();

    return new Response(responseBody, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ??
          "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[RadioUserProxy]", error);

    return Response.json(
      {
        success: false,
        message: "Impossible de contacter le serveur.",
      },
      { status: 502 }
    );
  }
}
