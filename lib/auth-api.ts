type ApiResponse<T = unknown> = {
    success: boolean;
    message?: string;
    user?: T;
    data?: T;
    errors?: Record<string, string[] | undefined>;
    code?: string;
};

export class AuthApiError extends Error {
    status: number;
    code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = "AuthApiError";
        this.status = status;
        this.code = code;
    }
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<ApiResponse<T>> {
    let response: Response;

    try {
        response = await fetch(endpoint, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            credentials: "same-origin",
            cache: "no-store",
        });
    } catch {
        throw new Error(
            "Impossible de contacter le serveur. Vérifiez votre connexion.",
        );
    }

    const result = (await response.json().catch(() => null)) as
        | ApiResponse<T>
        | null;

    if (!response.ok || !result?.success) {
        throw new AuthApiError(
            result?.message ?? "Une erreur est survenue.",
            response.status,
            result?.code,
        );
    }

    return result;
}

export type RegisterPayload = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string | null;
    emailVerified: boolean;
    isActive: boolean;
    globalRole?: string
};

export const authApi = {
    register: (payload: RegisterPayload) =>
        request<User>("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    login: (payload: LoginPayload) =>
        request<User>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    verifyEmail: (email: string, otp: string) =>
        request<User>("/api/auth/verify-email", {
            method: "POST",
            body: JSON.stringify({ email, otp }),
        }),

    forgotPassword: (email: string) =>
        request("/api/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email }),
        }),

    resetPassword: (
        email: string,
        otp: string,
        password: string,
    ) =>
        request("/api/auth/reset-password", {
            method: "POST",
            body: JSON.stringify({ email, otp, password }),
        }),
    resendVerification: (email: string) =>
        request("/api/auth/resend-verification", {
            method: "POST",
            body: JSON.stringify({ email }),
        }),
};