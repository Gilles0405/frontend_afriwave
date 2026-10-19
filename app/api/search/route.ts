
import { NextRequest, NextResponse } from "next/server";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"
).replace(/\/+$/, "");

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.toString();

    const response = await fetch(
      `${API_URL}/api/search${query ? `?${query}` : ""}`,
      {
        method: "GET",
        headers: {
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
    console.error("Erreur proxy de recherche AfriWave :", error);

    return NextResponse.json(
      {
        success: false,
        message: "Impossible de contacter le service de recherche.",
      },
      { status: 502 }
    );
  }
}
