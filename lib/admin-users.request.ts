
export interface AdminUser {
  id: number | string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatar?: string | null;
  globalRole: "USER" | "SUPER_ADMIN";
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UsersPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UsersResponse {
  success: boolean;
  data: AdminUser[];
  pagination: UsersPagination;
  message?: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  globalRole?: "USER" | "SUPER_ADMIN";
  isActive?: boolean;
  emailVerified?: boolean;
}

export async function getAdminUsers(
  params: GetUsersParams = {}
): Promise<UsersResponse> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.globalRole) {
    searchParams.set("globalRole", params.globalRole);
  }

  if (params.isActive !== undefined) {
    searchParams.set("isActive", String(params.isActive));
  }

  if (params.emailVerified !== undefined) {
    searchParams.set("emailVerified", String(params.emailVerified));
  }

  const response = await fetch(
    `/api/admin/users?${searchParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const result = (await response.json()) as UsersResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Impossible de récupérer les utilisateurs."
    );
  }

  return result;
}
