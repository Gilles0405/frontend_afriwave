

const API_URL = "";

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { token, body, headers, ...requestOptions } = options;

  const requestHeaders = new Headers(headers);

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      result?.message ?? "Une erreur est survenue.",
      response.status,
      result?.code,
    );
  }

  return result as T;
}

export type ArticleStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "ARCHIVED";

export interface RadioArticle {
  id: number;
  radioId?: number;
  categoryId?: number | null;
  authorId?: number;
  title: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status: ArticleStatus;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
}

export interface ArticlePayload {
  title: string;
  content: string;
  categoryId?: number | null;
  excerpt?: string | null;
  featuredImage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface ArticleFilters {
  page?: number;
  limit?: number;
  status?: ArticleStatus;
  categoryId?: number;
  search?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ArticleListResponse {
  success: boolean;
  data: RadioArticle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const basePath = (radioId: number) =>
  `/api/radio-articles/${radioId}`;

export const radioArticleService = {
  getArticles(
    radioId: number,
    filters: ArticleFilters = {},
    token?: string | null,
  ) {
    const params = new URLSearchParams();

    params.set("page", String(filters.page ?? 1));
    params.set("limit", String(filters.limit ?? 10));

    if (filters.status) {
      params.set("status", filters.status);
    }

    if (filters.categoryId) {
      params.set("categoryId", String(filters.categoryId));
    }

    if (filters.search?.trim()) {
      params.set("search", filters.search.trim());
    }

    return apiRequest<ArticleListResponse>(
      `${basePath(radioId)}?${params.toString()}`,
      { token },
    );
  },

  getArticleById(
    radioId: number,
    articleId: number,
    token?: string | null,
  ) {
    return apiRequest<ApiResponse<RadioArticle>>(
      `${basePath(radioId)}/${articleId}`,
      { token },
    );
  },

  createArticle(
    radioId: number,
    payload: ArticlePayload,
    token?: string | null,
  ) {
    return apiRequest<ApiResponse<RadioArticle>>(
      basePath(radioId),
      {
        method: "POST",
        body: payload,
        token,
      },
    );
  },

  updateArticle(
    radioId: number,
    articleId: number,
    payload: Partial<ArticlePayload>,
    token?: string | null,
  ) {
    return apiRequest<ApiResponse<RadioArticle>>(
      `${basePath(radioId)}/${articleId}`,
      {
        method: "PATCH",
        body: payload,
        token,
      },
    );
  },

  submitForReview(
    radioId: number,
    articleId: number,
    token?: string | null,
  ) {
    return apiRequest<ApiResponse<RadioArticle>>(
      `${basePath(radioId)}/${articleId}/submit-review`,
      { method: "POST", token },
    );
  },

  publishArticle(
    radioId: number,
    articleId: number,
    token?: string | null,
  ) {
    return apiRequest<ApiResponse<RadioArticle>>(
      `${basePath(radioId)}/${articleId}/publish`,
      { method: "POST", token },
    );
  },

  archiveArticle(
    radioId: number,
    articleId: number,
    token?: string | null,
  ) {
    return apiRequest<ApiResponse<RadioArticle>>(
      `${basePath(radioId)}/${articleId}/archive`,
      { method: "POST", token },
    );
  },

  uploadImage(
    radioId: number,
    image: File,
    token?: string | null,
  ) {
    const formData = new FormData();
    formData.append("image", image);

    return apiRequest<
      ApiResponse<{
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        imageUrl: string;
      }>
    >(`${basePath(radioId)}/upload-image`, {
      method: "POST",
      body: formData,
      token,
    });
  },
  deleteArticle(
  radioId: number,
  articleId: number,
  token?: string | null,
) {
  return apiRequest<ApiResponse<RadioArticle>>(
    `${basePath(radioId)}/${articleId}`,
    {
      method: "DELETE",
      token,
    },
  );
},
};




