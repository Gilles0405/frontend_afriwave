
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface RouteContext {
  params: Promise<{ radioId: string[] }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { radioId } = await params;

    if (!radioId?.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Identifiant de radio manquant.",
        },
        { status: 400 }
      );
    }

    // Récupérer la session côté serveur
    const cookieStore = await cookies();
    const token = cookieStore.get("afriwave_session")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Session expirée ou utilisateur non connecté.",
        },
        { status: 401 }
      );
    }

    const path = radioId
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    const response = await fetch(
      `${BACKEND_URL}/api/radio/${path}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Erreur proxy radio:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Impossible de récupérer cette radio.",
      },
      { status: 502 }
    );
  }
}
