
export interface Radio {
  id: number | string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  frequency?: string | null;
  city?: string | null;
  country?: string | null;
  website?: string | null;
  streamUrl?: string | null;
  createdAt?: string;
}

export interface RadioPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface RadiosResponse {
  success: boolean;
  data: Radio[];
  pagination: RadioPagination;
  message?: string;
}

interface RadioResponse {
  success: boolean;
  data: Radio;
  message?: string;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Une erreur est survenue.");
  }

  return result as T;
}

export async function getAllRadios(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<RadiosResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);

  const query = searchParams.toString();

  const response = await fetch(
    `/api/radios${query ? `?${query}` : ""}`,
    { method: "GET", cache: "no-store" }
  );

  return parseResponse<RadiosResponse>(response);
}

export async function getRadioDetail(
  radioId: number | string
): Promise<Radio> {
  const response = await fetch(
    `/api/radios/${encodeURIComponent(String(radioId))}`,
    { method: "GET", cache: "no-store" }
  );

  const result = await parseResponse<RadioResponse>(response);
  return result.data;
}
