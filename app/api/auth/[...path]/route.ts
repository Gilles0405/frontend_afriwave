
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_COOKIE = "afriwave_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

// Seuls ces endpoints et méthodes sont autorisés.
const allowedRoutes: Record<string, string[]> = {
  register: ["POST"],
  login: ["POST"],
  "verify-email": ["POST"],
  "resend-verification": ["POST"],
  "forgot-password": ["POST"],
  "reset-password": ["POST"],
  me: ["GET", "PATCH"],
};

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function handleRequest(
  request: NextRequest,
  context: RouteContext,
) {
  const { path } = await context.params;
  const endpoint = path.join("/");
  const method = request.method;

  // Déconnexion locale : on supprime le cookie de session.
  if (endpoint === "logout" && method === "POST") {
    const response = NextResponse.json({
      success: true,
      message: "Déconnexion réussie.",
    });

    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  }

  // Pas de proxy arbitraire vers des URL inconnues.
  if (
    path.length !== 1 ||
    !allowedRoutes[endpoint]?.includes(method)
  ) {
    return NextResponse.json(
      { success: false, message: "Route non autorisée." },
      { status: 404 },
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    console.error("AUTH_API_URL n'est pas configurée.");

    return NextResponse.json(
      { success: false, message: "Service API indisponible." },
      { status: 500 },
    );
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  const headers = new Headers({
    Accept: "application/json",
  });

  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  // Le JWT reste dans le cookie HttpOnly côté navigateur.
  // Next.js le transmet à Express uniquement côté serveur.
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const hasBody = !["GET", "HEAD"].includes(method);
  const body = hasBody ? await request.text() : undefined;

  let upstream: Response;

  try {
    upstream = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/api/auth/${endpoint}`,
      {
        method,
        headers,
        body,
        cache: "no-store",
      },
    );
  } catch (error) {
    console.error("Erreur de communication avec Express :", error);

    return NextResponse.json(
      { success: false, message: "Impossible de contacter le serveur." },
      { status: 502 },
    );
  }

  const result: unknown = await upstream
    .json()
    .catch(() => null);

  if (
    !result ||
    typeof result !== "object" ||
    Array.isArray(result)
  ) {
    return NextResponse.json(
      { success: false, message: "Réponse invalide du serveur." },
      { status: 502 },
    );
  }

  const data = result as Record<string, unknown>;
  const jwt = endpoint === "login" ? data.token : undefined;

  // Le backend doit fournir un JWT pour établir la session.
  if (endpoint === "login" && upstream.ok) {
    if (typeof jwt !== "string" || !jwt) {
      return NextResponse.json(
        { success: false, message: "Jeton de session manquant." },
        { status: 502 },
      );
    }
  }

  // Ne jamais renvoyer le JWT dans le JSON au navigateur.
  const { token: _token, ...safeData } = data;

  const response = NextResponse.json(safeData, {
    status: upstream.status,
  });

  if (endpoint === "login" && upstream.ok && typeof jwt === "string") {
    response.cookies.set(SESSION_COOKIE, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
  }

  return response;
}

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as PATCH,
};
