
export type RadioRole = {
  id: number;
  name: string;
  description: string | null;
};

export type RadioTeamMember = {
  userId: number;
  radioId: number;
  roleId: number;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
    isActive: boolean;
    emailVerified: boolean;
  };
  role: RadioRole;
};

export type RadioInvitation = {
  token: string;
  email: string;
  roleId: number;
  role?: RadioRole;
  radio?: {
    id: number;
    name: string;
    logo?: string | null;
  };
  expiresAt?: string;
}
type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message || `Erreur API (${response.status})`
    );
  }

  return result as T;
}

export const RadioUserService = {
  async getMembers(radioId: number) {
    const response = await apiRequest<
      ApiResponse<RadioTeamMember[]>
    >(`/api/radio/${radioId}/users`);

    return response.data;
  },

  async updateRole(
    radioId: number,
    userId: number,
    roleId: number
  ) {
    const response = await apiRequest<
      ApiResponse<RadioTeamMember>
    >(`/api/radio/${radioId}/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ roleId }),
    });

    return response.data;
  },

  async removeMember(radioId: number, userId: number) {
    return apiRequest<ApiResponse<boolean>>(
      `/api/radio/${radioId}/users/${userId}`,
      { method: "DELETE" }
    );
  },

  async inviteMember(
    radioId: number,
    email: string,
    roleId: number
  ) {
    return apiRequest<ApiResponse<unknown>>(
      `/api/radio/${radioId}/invitations`,
      {
        method: "POST",
        body: JSON.stringify({ email, roleId }),
      }
    );
  },

  async getInvitation(token: string) {
    const response = await apiRequest<
      ApiResponse<RadioInvitation>
    >(
      `/api/radio-invitations/${encodeURIComponent(token)}`
    );

    return response.data;
  },

  async acceptInvitation(data: {
    token: string;
    firstName: string;
    lastName: string;
    password: string;
  }) {
    return apiRequest<ApiResponse<unknown>>(
      "/api/radio-invitations/accept",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  async acceptExistingInvitation(token: string) {
    return apiRequest<ApiResponse<unknown>>(
      "/api/radio-invitations/accept-existing",
      {
        method: "POST",
        body: JSON.stringify({ token }),
      }
    );
  },
  async getAssignableRoles(): Promise<RadioRole[]> {
  const response = await apiRequest<ApiResponse<RadioRole[]>>(
    "/api/roles/radio-assignable"
  );

  return response.data;
}
};
