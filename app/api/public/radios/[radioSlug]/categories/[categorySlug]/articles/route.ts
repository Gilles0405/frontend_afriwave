
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    radioSlug: string;
    categorySlug: string;
  }>;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? ""
).replace(/\/+$/, "");

export async function GET(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { radioSlug, categorySlug } = await params;
    const query = request.nextUrl.searchParams.toString();

    const backendPath =
      `/api/public/radios/${encodeURIComponent(radioSlug)}` +
      `/categories/${encodeURIComponent(categorySlug)}/articles`;

    const url = `${API_URL}${backendPath}${
      query ? `?${query}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const body = await response.json().catch(() => ({
      success: false,
      message: "Réponse invalide du serveur.",
    }));

    return NextResponse.json(body, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "[RadioCategoryArticlesProxy] Erreur réseau :",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Impossible de récupérer les articles de cette catégorie.",
      },
      { status: 502 },
    );
  }
}
