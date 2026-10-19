

export type RadioMediaType = "show" | "podcast" | "article";

export type RadioMediaStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED"
  | "PENDING"
  | "REJECTED"
  | string;

export interface RadioMedia {
  id: number;
  radioId: number;
  type: RadioMediaType;
  title: string;
  slug: string;
  status: RadioMediaStatus;
  imageUrl: string | null;
  audioUrl: string | null;
  duration: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RadioMediaPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RadioMediaResponse {
  items: RadioMedia[];
  pagination: RadioMediaPagination;
}

export interface ListRadioMediaParams {
  type: RadioMediaType;
  page?: number;
  limit?: number;
  status?: string;
}
async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ??
        `Request failed with status ${response.status}`,
    );
  }

  // Le backend renvoie { success: true, data: { items, pagination } }
  return result.data as T;
}

export async function listRadioMedia(
  radioId: number,
  params: ListRadioMediaParams,
): Promise<RadioMediaResponse> {
  const query = new URLSearchParams({
    type: params.type,
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 20),
  });

  if (params.status) {
    query.set("status", params.status);
  }

  return requestJson<RadioMediaResponse>(
    `/api/radio-media/${radioId}?${query.toString()}`,
  );
}


export function buildRadioMediaImageUrl(
  path: string | null,
): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;

  const baseUrl = (
    process.env.NEXT_PUBLIC_API_URL ?? ""
  ).replace(/\/+$/, "");

  if (!baseUrl) return undefined;

  return `${baseUrl}/${path.replace(/^\/+/, "")}`;
}
export function buildRadioMediaAudioUrl(
  path: string | null,
): string | undefined {
  if (!path) return undefined;

  // URL externe déjà complète
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_API_URL ?? ""
  ).replace(/\/+$/, "");

  if (!baseUrl) return undefined;

  return `${baseUrl}/${path.replace(/^\/+/, "")}`;
}
