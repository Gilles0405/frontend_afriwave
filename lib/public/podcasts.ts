
import "server-only";
import { absoluteUrl } from "@/lib/seo";

export type GlobalPublicPodcast = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  audioUrl: string;
  coverImage?: string | null;
  duration?: number | null;
  publishedAt?: string | null;
  radio: {
    id: number;
    name: string;
    slug: string;
    logo?: string | null;
    city?: string | null;
    country?: string | null;
  };
};

export type PublicPodcastPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type PublicPodcastsResponse = {
  success: boolean;
  data: GlobalPublicPodcast[];
  pagination: PublicPodcastPagination;
};

export async function getAllPublicPodcasts({
  page = 1,
  limit = 12,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<{
  podcasts: GlobalPublicPodcast[];
  pagination: PublicPodcastPagination;
}> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const url = absoluteUrl(
    `/api/public/radios/podcasts/all?${params.toString()}`,
  );

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "Erreur API podcasts publics :",
        response.status,
      );

      return {
        podcasts: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const result =
      (await response.json()) as PublicPodcastsResponse;

    return {
      podcasts: Array.isArray(result.data) ? result.data : [],
      pagination: result.pagination ?? {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (error) {
    console.error(
      "Impossible de récupérer les podcasts publics :",
      error,
    );

    return {
      podcasts: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }
}


export type PublicPodcastRadio = {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  city?: string | null;
  country?: string | null;
};

export type PublicPodcastDetail = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  audioUrl: string;
  coverImage?: string | null;
  duration?: number | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  radioId?: number;
  status?: string;
};

type PublicPodcastDetailResponse = {
  success: boolean;
  data:
    | PublicPodcastDetail
    | {
        radio: PublicPodcastRadio;
        podcast: PublicPodcastDetail;
      };
};

export async function getPublicPodcastBySlug(
  radioSlug: string,
  slug: string,
): Promise<{
  radio: PublicPodcastRadio | null;
  podcast: PublicPodcastDetail;
} | null> {
  const path =
    `/api/public/radios/${encodeURIComponent(radioSlug)}` +
    `/podcasts/${encodeURIComponent(slug)}`;

  try {
    const response = await fetch(absoluteUrl(path), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.error(
        "Erreur récupération du podcast :",
        response.status,
      );
      return null;
    }

    const result =
      (await response.json()) as PublicPodcastDetailResponse;

    if (!result.success || !result.data) {
      return null;
    }

    // Format 1 : le backend renvoie radio + podcast.
    if (
      "podcast" in result.data &&
      "radio" in result.data
    ) {
      return {
        radio: result.data.radio,
        podcast: result.data.podcast,
      };
    }

    // Format 2 : le backend renvoie directement le podcast.
    const podcast = result.data;

    // Vérification minimale des données du podcast.
    if (
      typeof podcast.id !== "number" ||
      typeof podcast.title !== "string" ||
      typeof podcast.slug !== "string" ||
      typeof podcast.audioUrl !== "string"
    ) {
      console.error("Réponse API du podcast invalide.");
      return null;
    }

    return {
      radio: null,
      podcast,
    };
  } catch (error) {
    console.error(
      "Impossible de charger le podcast :",
      error,
    );
    return null;
  }
}



export type PublicRadioPodcast = {
  id: number;
  radioId: number;
  createdBy?: number;
  title: string;
  slug: string;
  description?: string | null;
  audioUrl: string;
  coverImage?: string | null;
  duration?: number | null;
  status?: string;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type PublicPodcastsPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PublicRadioPodcastsResponse = {
  success: boolean;
  data: {
    items: PublicRadioPodcast[];
    pagination: PublicPodcastsPagination;
  };
};

export async function getPublicRadioPodcasts(
  radioSlug: string,
  page = 1,
  limit = 10,
): Promise<PublicRadioPodcastsResponse["data"] | null> {
  try {
    const url = absoluteUrl(
      `/api/public/radios/${encodeURIComponent(radioSlug)}/podcasts?page=${page}&limit=${limit}`,
    );

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const result =
      (await response.json()) as PublicRadioPodcastsResponse;
    if (!result.success || !result.data) {
      return null;
    }

    return {
      items: Array.isArray(result.data.items)
        ? result.data.items
        : [],
      pagination: result.data.pagination ?? {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  } catch (error) {
    console.error("Erreur récupération des podcasts publics :", error);
    return null;
  }
}
