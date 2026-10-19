
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function GET(request: NextRequest) {
  try {
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

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.toString();

    const response = await fetch(
      `${BACKEND_URL}/api/users${query ? `?${query}` : ""}`,
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
    console.error("Erreur proxy admin users:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Impossible de récupérer les utilisateurs.",
      },
      { status: 502 }
    );
  }
}
