
export type PodcastStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface RadioPodcast {
  id: number;
  radioId: number;
  createdBy: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  audioUrl: string;
  duration: number | null;
  status: PodcastStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PodcastPayload {
  title: string;
  description?: string | null;
  slug?: string;
  duration?: number | null;
}

export interface PodcastListParams {
  page?: number;
  limit?: number;
  status?: PodcastStatus;
}

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

async function apiRequest<T>(
  url: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Une erreur est survenue.");
  }

  return result as ApiResponse<T>;
}

export const radioPodcastService = {
  async getPodcasts(radioId: number, params: PodcastListParams = {}) {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
    });

    if (params.status) query.set("status", params.status);

    return apiRequest<{
      items: RadioPodcast[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/api/radio-podcasts/${radioId}?${query}`);
  },

  async getPodcast(radioId: number, podcastId: number) {
    return apiRequest<RadioPodcast>(
      `/api/radio-podcasts/${radioId}/${podcastId}`,
    );
  },

  async createPodcast(radioId: number, formData: FormData) {
    return apiRequest<RadioPodcast>(
      `/api/radio-podcasts/${radioId}`,
      { method: "POST", body: formData },
    );
  },

  async updatePodcast(
    radioId: number,
    podcastId: number,
    payload: PodcastPayload,
  ) {
    return apiRequest<RadioPodcast>(
      `/api/radio-podcasts/${radioId}/${podcastId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
  },

  async publishPodcast(radioId: number, podcastId: number) {
    return apiRequest<RadioPodcast>(
      `/api/radio-podcasts/${radioId}/${podcastId}/publish`,
      { method: "POST" },
    );
  },

  async archivePodcast(radioId: number, podcastId: number) {
    return apiRequest<RadioPodcast>(
      `/api/radio-podcasts/${radioId}/${podcastId}/archive`,
      { method: "POST" },
    );
  },

  async deletePodcast(radioId: number, podcastId: number) {
    return apiRequest<unknown>(
      `/api/radio-podcasts/${radioId}/${podcastId}`,
      { method: "DELETE" },
    );
  },
};
