

export type PublicRadio = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  frequency?: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  twitter?: string | null;
  streamUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RadioPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type PublicRadiosResponse = {
  success: boolean;
  data: PublicRadio[];
  pagination: RadioPagination;
};

export type PublicRadioDetailResponse = {
  success: boolean;
  data: PublicRadio;
};
function getPublicSiteBaseUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configuredUrl) {
    throw new Error(
      "URL du site manquante : configure NEXT_PUBLIC_SITE_URL dans .env.local.",
    );
  }

  try {
    return new URL(configuredUrl).toString();
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL n'est pas une URL valide : ${configuredUrl}`,
    );
  }
}
async function fetchPublicApi<T>(path: string): Promise<T> {
  const baseUrl = getPublicSiteBaseUrl();
  
  const url = new URL(path, baseUrl);
console.info("[PublicShows] Appel API :", {
  baseUrl,
  path,
  url: url.toString(),
});
  let response: Response;

  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error("[PublicShows] Erreur réseau :", {
      url: url.toString(),
      error,
    });

    throw new Error(
      "Impossible de contacter le serveur public AfriWave.",
    );
  }

  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof result.message === "string"
        ? result.message
        : `Erreur lors du chargement des émissions (${response.status}).`;

    throw new Error(message);
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("success" in result) ||
    result.success !== true
  ) {
    throw new Error(
      "La réponse du serveur public AfriWave est invalide.",
    );
  }

  return result as T;
}

function buildQuery(params: PaginationParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

export function getPublicRadios(
  params: PaginationParams = {},
): Promise<PublicRadiosResponse> {
  return fetchPublicApi<PublicRadiosResponse>(
    `/api/radio${buildQuery(params)}`,
  );
}

export function getPublicRadioBySlug(
  slug: string,
): Promise<PublicRadioDetailResponse> {
  return fetchPublicApi<PublicRadioDetailResponse>(
    `/api/public/radios/${encodeURIComponent(slug)}`,
  );
}