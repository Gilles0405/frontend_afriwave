
export interface UserProfile {
  id: number | string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatar: string | null;
  isActive: boolean;
  emailVerified: boolean;
}

interface ProfileResponse {
  success?: boolean;
  data?: UserProfile;
  user?: UserProfile;
  message?: string;
}

async function requestProfile(
  method: "GET" | "PATCH",
  data?: Partial<Pick<UserProfile, "firstName" | "lastName" | "avatar">>
): Promise<UserProfile> {
  const response = await fetch("/api/auth/me", {
    method,
    headers: {
      Accept: "application/json",
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
    cache: "no-store",
  });

  const result = (await response.json()) as ProfileResponse;

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Une erreur est survenue.");
  }

  const profile = result.data ?? result.user;

  if (!profile) {
    throw new Error("Les données du profil sont introuvables.");
  }

  return profile;
}

export function getMyProfile(): Promise<UserProfile> {
  return requestProfile("GET");
}

export function updateMyProfile(
  data: Partial<Pick<UserProfile, "firstName" | "lastName" | "avatar">>
): Promise<UserProfile> {
  return requestProfile("PATCH", data);
}
