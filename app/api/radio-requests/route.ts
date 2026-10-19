
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (!apiBase) {
    return NextResponse.json(
      { success: false, message: "URL du backend non configurée" },
      { status: 500 },
    );
  }

  // Conserve les paramètres de recherche et de pagination.
  const query = request.nextUrl.searchParams.toString();
  const url = `${apiBase}/api/radio-requests${query ? `?${query}` : ""}`;

  // Adapte le nom du cookie à ton authentification réelle.
  const token = request.cookies.get("afriwave_session")?.value;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
      cache: "no-store",
    });

    const body = await response.json();

    return NextResponse.json(body, { status: response.status });
  } catch (error) {
    console.error("Proxy radio-requests :", error);

    return NextResponse.json(
      { success: false, message: "Backend Express inaccessible" },
      { status: 502 },
    );
  }
}
