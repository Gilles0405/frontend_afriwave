export type ArticleCategory = {
  id: number | string;
  name: string;
  slug: string;
  description?: string | null;
};

export type ArticleAuthor = {
  id: number | string;
  name: string;
  avatar?: string | null;
};

export type PublicArticle = {
  id: number | string;
  radioId: number | string;
  authorId?: number | string | null;
  categoryId?: number | string | null;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featuredImage?: string | null;
  status?: string;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  category?: ArticleCategory | null;
  author?: ArticleAuthor | null;
};

export type PublicRadio = {
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
};

export type ArticlePagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  radio?: PublicRadio;
  pagination?: ArticlePagination;
  message?: string;
  error?: string;
};

export type ArticleListParams = {
  categorySlug?: string;
  search?: string;
  page?: number;
  limit?: number;
};

function getArticlesBasePath(radioSlug: string) {
  return `/api/public/radios/${encodeURIComponent(radioSlug)}/articles`;
}

async function requestPublicApi<T>(path: string): Promise<T> {
  // Le serveur Next.js appelle Express directement.
  // Le navigateur passe toujours par le proxy Next.js.
  const baseUrl =
    typeof window === "undefined"
      ? process.env.API_URL || process.env.NEXT_PUBLIC_API_URL
      : "";

  if (typeof window === "undefined" && !baseUrl) {
    throw new Error("API_URL non configurée.");
  }

  const url =
    typeof window === "undefined"
      ? new URL(path, `${baseUrl!.replace(/\/+$/, "")}/`)
      : path;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    ...(typeof window === "undefined"
      ? { next: { revalidate: 300 } }
      : { cache: "no-store" as const }),
  });

  const text = await response.text();

  let result: ApiResponse<unknown>;

  try {
    result = JSON.parse(text) as ApiResponse<unknown>;
  } catch {
    throw new Error(`Réponse API invalide (HTTP ${response.status}).`);
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || result.error || `Erreur API (HTTP ${response.status}).`
    );
  }

  return result as T;
}

export async function getPublicArticles(
  radioSlug: string,
  params: ArticleListParams = {}
) {
  const query = new URLSearchParams();

  if (params.categorySlug) {
    query.set("categorySlug", params.categorySlug);
  }

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.page !== undefined) {
    query.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    query.set("limit", String(params.limit));
  }

  const suffix = query.size ? `?${query.toString()}` : "";
  const result = await requestPublicApi<ApiResponse<PublicArticle[]>>(
    `${getArticlesBasePath(radioSlug)}${suffix}`
  );

  if (!result.pagination || !result.radio) {
    throw new Error("Réponse de liste d’articles incomplète.");
  }

  return {
    articles: result.data,
    radio: result.radio,
    pagination: result.pagination,
  };
}

export async function getPublicArticleBySlug(radioSlug: string, slug: string) {
  const result = await requestPublicApi<ApiResponse<PublicArticle>>(
    `${getArticlesBasePath(radioSlug)}/${encodeURIComponent(slug)}`
  );

  if (!result.radio) {
    throw new Error("Informations de la radio absentes.");
  }

  return {
    article: result.data,
    radio: result.radio,
  };
}

export async function getLatestPublicArticles(radioSlug: string, limit = 5) {
  const query = new URLSearchParams({ limit: String(limit) });

  const result = await requestPublicApi<ApiResponse<PublicArticle[]>>(
    `${getArticlesBasePath(radioSlug)}/latest?${query.toString()}`
  );

  if (!result.radio) {
    throw new Error("Informations de la radio absentes.");
  }

  return {
    articles: result.data,
    radio: result.radio,
  };
}

export async function getRelatedPublicArticles(
  radioSlug: string,
  slug: string,
  limit = 5
) {
  const query = new URLSearchParams({ limit: String(limit) });

  const result = await requestPublicApi<ApiResponse<PublicArticle[]>>(
    `${getArticlesBasePath(radioSlug)}/${encodeURIComponent(slug)}/related?${query.toString()}`
  );

  if (!result.radio) {
    throw new Error("Informations de la radio absentes.");
  }

  return {
    articles: result.data,
    radio: result.radio,
  };
}

export type GlobalPublicArticle = PublicArticle & {
  radioSlug: string;
  radioName: string;
};

export async function getAllPublicArticles(
  params: ArticleListParams = {}
): Promise<{
  articles: GlobalPublicArticle[];
  pagination: ArticlePagination;
}> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 12),
  });

  if (params.categorySlug) {
    query.set("categorySlug", params.categorySlug);
  }

  if (params.search) {
    query.set("search", params.search);
  }

  const result = await requestPublicApi<ApiResponse<GlobalPublicArticle[]>>(
    `/api/public/articles?${query.toString()}`
  );

  if (!result.pagination || !Array.isArray(result.data)) {
    throw new Error("Réponse de la liste globale incomplète.");
  }

  return {
    articles: result.data,
    pagination: result.pagination,
  };
}