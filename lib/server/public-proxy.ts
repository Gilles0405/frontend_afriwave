
import "server-only";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

export async function publicProxy(
  request: Request,
  backendPath: string,
) {
  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(
    backendPath.replace(/^\/+/, ""),
    `${BACKEND_URL.replace(/\/+$/, "")}/`,
  );

  incomingUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.append(key, value);
  });

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    const body = await upstream.text();

    return new Response(body, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ??
          "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      {
        success: false,
        message: "Le service public est temporairement indisponible.",
      },
      { status: 502 },
    );
  }
}
