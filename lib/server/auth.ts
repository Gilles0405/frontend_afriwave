import "server-only";
import { jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
export const SESSION_COOKIE = "afriwave_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export async function verifySessionToken(
  token: string,
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      getJwtSecret(),
      { algorithms: ["HS256"] },
    );

    if (
      typeof payload.id !== "number" &&
      typeof payload.id !== "string"
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}


export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    console.warn("[Auth] Session absente ou JWT invalide.");
    return null;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!apiUrl || !token) {
    console.error("[Auth] API URL ou cookie de session manquant.");
    return null;
  }

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/api/auth/me`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("[Auth] /api/auth/me a répondu :", response.status);
      return null;
    }

    const result = await response.json();
    const user = result?.user ?? result?.data?.user ?? result?.data;

    if (!result?.success || !user) {
      console.error("[Auth] Structure de réponse inattendue de /api/auth/me.");
      return null;
    }

    if (user.emailVerified !== true) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("[Auth] Erreur lors de la vérification :", error);
    return null;
  }
}
