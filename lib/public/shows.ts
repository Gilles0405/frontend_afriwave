
export type PublicShow = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  hostName?: string | null;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  timezone: string;
};

export type PublicShowRadio = {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
};

export type PublicShowsResponse = {
  success: boolean;
  radio: PublicShowRadio;
  data: PublicShow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type PublicShowDetailResponse = {
  success: boolean;
  radio: PublicShowRadio;
  data: PublicShow;
};

export type PublicGlobalShowsResponse = {
  success: boolean;
  data: PublicShowListItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type PublicShowListItem = PublicShow & {
  radioId: number;
  createdAt?: string | null;
  radio: PublicShowRadio & {
    city?: string | null;
    country?: string | null;
  };
};

type PaginationParams = {
  page?: number;
  limit?: number;
};

function getPublicApiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!configuredUrl) {
    throw new Error(
      "URL de l'API manquante : configure API_BASE_URL dans l'environnement serveur.",
    );
  }

  try {
    const url = new URL(configuredUrl);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Protocole invalide");
    }

    return url.toString().replace(/\/+$/, "");
  } catch {
    throw new Error(
      `API_BASE_URL n'est pas une URL valide : ${configuredUrl}`,
    );
  }
}

async function fetchPublicApi<T>(path: string): Promise<T> {
  const baseUrl =  getPublicApiBaseUrl();
  
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

/**
 * Liste paginée des émissions d'une radio.
 */
export function getPublicRadioShows(
  radioSlug: string,
  params: PaginationParams = {},
): Promise<PublicShowsResponse> {
  return fetchPublicApi<PublicShowsResponse>(
    `/api/public/radios/${encodeURIComponent(radioSlug)}/shows${buildQuery(params)}`,
  );
}

/**
 * Détail d'une émission d'une radio.
 */

export async function getPublicShowDetail(
  radioSlug: string,
  showSlug: string,
): Promise<PublicShowDetailResponse> {

  if (
    !radioSlug ||
    !showSlug ||
    radioSlug === "undefined" ||
    showSlug === "undefined"
  ) {
    throw new Error(
      `Paramètres invalides pour le détail de l'émission : radioSlug=${radioSlug}, showSlug=${showSlug}`,
    );
  }

  const path =
    `/api/public/radios/${encodeURIComponent(radioSlug)}` +
    `/shows/${encodeURIComponent(showSlug)}`;

  return fetchPublicApi<PublicShowDetailResponse>(path);
}


/**
 * Liste globale des émissions.
 */
export function getPublicShows(
  params: PaginationParams = {},
): Promise<PublicGlobalShowsResponse> {
  return fetchPublicApi<PublicGlobalShowsResponse>(
    `/api/public/shows${buildQuery(params)}`,
  );
}
