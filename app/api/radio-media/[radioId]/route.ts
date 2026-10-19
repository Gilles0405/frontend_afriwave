import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/server/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

type RouteContext = {
  params: Promise<{ radioId: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { success: false, message: "BACKEND_URL non configurée." },
        { status: 500 },
      );
    }

    const { radioId } = await params;

    if (!/^\d+$/.test(radioId)) {
      return NextResponse.json(
        { success: false, message: "Identifiant de radio invalide." },
        { status: 400 },
      );
    }

    // Récupération du JWT depuis le cookie de session sécurisé.
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Session absente. Veuillez vous reconnecter." },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams.toString();
    const baseUrl = BACKEND_URL.replace(/\/+$/, "");
    const url = `${baseUrl}/api/radio-media/${radioId}${
      searchParams ? `?${searchParams}` : ""
    }`;

    // Transmission du JWT au middleware authenticate d'Express.
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("[RadioMedia proxy] Erreur :", error);

    return NextResponse.json(
      {
        success: false,
        message: "Impossible de récupérer les médias de la radio.",
      },
      { status: 502 },
    );
  }
}