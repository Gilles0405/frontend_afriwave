
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_COOKIE = "afriwave_session";

export async function GET(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { success: false, message: "Service API indisponible." },
      { status: 500 },
    );
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Session absente ou expirée." },
      { status: 401 },
    );
  }

  let upstream: Response;

  try {
    upstream = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/api/analytics/admin/overview`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );
  } catch (error) {
    console.error("Proxy analytics admin overview :", error);

    return NextResponse.json(
      { success: false, message: "Impossible de contacter Express." },
      { status: 502 },
    );
  }

  const body = await upstream.text();

  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
