
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL?? "http://localhost:3001";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ radioId: string }> },
) {
  try {
    const { radioId } = await params;

    if (!/^\d+$/.test(radioId)) {
      return NextResponse.json(
        { success: false, message: "Identifiant de radio invalide." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("afriwave_session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Session expirée ou absente." },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/analytics/${radioId}/overview`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    const body = await response.json();

    return NextResponse.json(body, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erreur du proxy analytics radio :", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la récupération des statistiques.",
      },
      { status: 500 },
    );
  }
}
