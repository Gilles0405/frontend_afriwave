
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("afriwave_session")?.value;
}

async function proxyRequest(
  method: "GET" | "PATCH",
  body?: unknown
) {
  try {
    const token = await getToken();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Session non valide ou expirée." },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Erreur proxy profil:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Impossible de communiquer avec le serveur.",
      },
      { status: 502 }
    );
  }
}

export async function GET() {
  return proxyRequest("GET");
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // Autoriser uniquement les champs modifiables du profil.
    const { firstName, lastName, avatar } = body ?? {};

    return proxyRequest("PATCH", {
      ...(firstName !== undefined ? { firstName } : {}),
      ...(lastName !== undefined ? { lastName } : {}),
      ...(avatar !== undefined ? { avatar } : {}),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Données du formulaire invalides." },
      { status: 400 }
    );
  }
}
