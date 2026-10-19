
export type RadioRequestPayload = {
  name: string;
  description?: string;
  frequency?: string;
  city?: string;
  country: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  streamUrl?: string;
};

export type RadioRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type RadioRequest = {
  id: number | string;
  name: string;
  description?: string | null;
  frequency?: string | null;
  city?: string | null;
  country: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  streamUrl?: string | null;
  status: RadioRequestStatus;
  createdAt?: string | null;
  created_at?: string | null;
  updatedAt?: string | null;
  rejectionReason?: string | null;
  rejection_reason?: string | null;
};

export type RadioRequestResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
};

export type RadioRequestListParams = {
  page?: number;
  limit?: number;
  status?: RadioRequestStatus;
  search?: string;
};

export type RadioRequestListResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data: T[];
  pagination?: {
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  code?: string;
};

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });

  const result = (await response.json().catch(() => null)) as
    | (RadioRequestResponse & Record<string, unknown>)
    | null;

  if (!response.ok || result?.success === false || !result) {
    throw new Error(
      typeof result?.message === "string"
        ? result.message
        : `Erreur API (${response.status})`,
    );
  }

  return result as T;
}

export const radioRequestApi = {
  create(payload: RadioRequestPayload) {
    return request<RadioRequestResponse<RadioRequest>>(
      "/api/radio-requests/create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
  },

  list(params: RadioRequestListParams = {}) {
    const query = new URLSearchParams();

    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 10));

    if (params.status) query.set("status", params.status);
    if (params.search?.trim()) {
      query.set("search", params.search.trim());
    }

    return request<RadioRequestListResponse<RadioRequest>>(
      `/api/radio-requests?${query.toString()}`,
    );
  },

  getById(id: number | string) {
    return request<RadioRequestResponse<RadioRequest>>(
      `/api/radio-requests/detail/${encodeURIComponent(String(id))}`,
    );
  },

  approve(id: number | string) {
    return request<RadioRequestResponse<RadioRequest>>(
      `/api/radio-requests/${encodeURIComponent(String(id))}/approve`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
    );
  },

  reject(id: number | string, reason: string) {
    return request<RadioRequestResponse<RadioRequest>>(
      `/api/radio-requests/${encodeURIComponent(String(id))}/reject`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      },
    );
  },
};
