
export type RadioSettings = {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  frequency: string | null;
  city: string | null;
  country: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  twitter: string | null;
  streamUrl: string | null;
};

export type UserProfile = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  radioId?: number | null;
  radio_id?: number | null;
  radio?: {
    id?: number | string;
  } | null;
  radioUsers?: Array<{
    userId: number;
    radioId: number;
    roleId: number;
    radio?: {
      id: number;
      name: string;
      slug: string;
      logo: string | null;
      coverImage: string | null;
      frequency: string | null;
      city: string | null;
      country: string | null;
      status: string;
    } | null;
    role?: {
      id: number;
      name: string;
      description?: string | null;
    } | null;
  }>;
};

export type UpdateRadioPayload = Partial<
  Omit<RadioSettings, "id">
>;

export type UpdateUserProfilePayload = Partial<
  Pick<UserProfile, "firstName" | "lastName" | "email" | "phone">
>;

type ApiObject = Record<string, unknown>;

function isObject(value: unknown): value is ApiObject {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

async function requestJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init?.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...init?.headers,
    },
  });

  const raw = await response.text();

  let result: unknown;

  try {
    result = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(
      `Réponse non JSON du serveur (HTTP ${response.status}). Vérifie le proxy Next.js.`,
    );
  }

  if (!response.ok) {
    const body = isObject(result) ? result : {};

    throw new Error(
      typeof body.message === "string"
        ? body.message
        : `Erreur HTTP ${response.status}.`,
    );
  }

  if (!isObject(result)) {
    throw new Error(
      "La réponse du serveur est vide ou invalide.",
    );
  }

  if (result.success === false || result.error) {
    throw new Error(
      typeof result.message === "string"
        ? result.message
        : "La requête API a échoué.",
    );
  }

  // Format : { success: true, data: {...} }
  if ("data" in result && result.data !== undefined) {
    return result.data as T;
  }

  // Format : { success: true, user: {...} }
  if ("user" in result && result.user !== undefined) {
    return result.user as T;
  }

  // Format : { success: true, radio: {...} }
  if ("radio" in result && result.radio !== undefined) {
    return result.radio as T;
  }

  // Format : l'objet utilisateur ou radio est directement renvoyé.
  if (!("success" in result) && !("error" in result)) {
    return result as T;
  }

  throw new Error(
    typeof result.message === "string"
      ? result.message
      : "Format de réponse API non reconnu.",
  );
}

/**
 * Récupère le profil de l'utilisateur connecté.
 * Le proxy Next.js transmet la requête au backend.
 */
export async function getUserProfile(): Promise<UserProfile> {
  return requestJson<UserProfile>(
    "/api/settings/profile",
  );
}

/**
 * Met à jour le profil de l'utilisateur connecté.
 */
export async function updateUserProfile(
  payload: UpdateUserProfilePayload,
): Promise<UserProfile> {
  return requestJson<UserProfile>(
    "/api/settings/profile",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Récupère les paramètres d'une radio.
 */
export async function getRadioSettings(
  radioId: number,
): Promise<RadioSettings> {
  if (
    !Number.isSafeInteger(radioId) ||
    radioId <= 0
  ) {
    throw new Error("Identifiant de radio invalide.");
  }

  return requestJson<RadioSettings>(
    `/api/settings/radios/${radioId}`,
  );
}

/**
 * Met à jour les paramètres d'une radio.
 */
export async function updateRadioSettings(
  radioId: number,
  payload: UpdateRadioPayload,
): Promise<RadioSettings> {
  if (
    !Number.isSafeInteger(radioId) ||
    radioId <= 0
  ) {
    throw new Error("Identifiant de radio invalide.");
  }

  return requestJson<RadioSettings>(
    `/api/settings/radios/${radioId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Charge les données nécessaires à la page des paramètres.
 * L'identifiant est extrait des associations radioUsers du profil.
 */
export async function getRadioSettingsPageData() {
  const user = await getUserProfile();

  const rawRadioId =
    user.radioUsers?.[0]?.radioId ??
    user.radioId ??
    user.radio_id ??
    user.radio?.id;

  if (
    rawRadioId === undefined ||
    rawRadioId === null ||
    rawRadioId === ""
  ) {
    throw new Error(
      "Aucune radio n'est associée à ce compte.",
    );
  }

  const radioId = Number(rawRadioId);

  if (
    !Number.isSafeInteger(radioId) ||
    radioId <= 0
  ) {
    throw new Error(
      "L'identifiant de la radio associée est invalide.",
    );
  }

  const radio = await getRadioSettings(radioId);

  return {
    user,
    radio,
    radioId,
  };
}



export async function uploadRadioImage(
  radioId: number,
  file: File,
): Promise<string> {
  if (!Number.isSafeInteger(radioId) || radioId <= 0) {
    throw new Error("Identifiant de radio invalide.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `/api/radios/${radioId}/upload-image`,
    {
      method: "POST",
      body: formData,
      credentials: "same-origin",
      cache: "no-store",
    },
  );

  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof result.message === "string"
        ? result.message
        : "Échec de l'envoi de l'image.";

    throw new Error(message);
  }

  if (typeof result !== "object" || result === null) {
    throw new Error("Réponse d'upload invalide.");
  }

  const body = result as {
    url?: string;
    imageUrl?: string;
    data?: {
      url?: string;
      imageUrl?: string;
    };
  };

  const imageUrl =
    body.url ??
    body.imageUrl ??
    body.data?.url ??
    body.data?.imageUrl;

  if (!imageUrl) {
    throw new Error(
      "L'API n'a pas renvoyé l'URL de l'image.",
    );
  }

  return imageUrl;
}
