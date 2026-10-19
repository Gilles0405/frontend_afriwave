"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
} from "lucide-react";
import { loginSchema } from "@/lib/validations/auth.schema";
import { authApi, AuthApiError } from "@/lib/auth-api";


export default function LoginPage() {
    const t = useTranslations("Auth");
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setFieldErrors({});

        const validation = loginSchema.safeParse({
            email: email.trim().toLowerCase(),
            password,
        });

        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;

            setFieldErrors({
                email: errors.email?.[0],
                password: errors.password?.[0],
            });

            return;
        }

        setLoading(true);

        try {




            const result = await authApi.login(validation.data);
            const user = result.user ?? result.data;

            if (!user) {
                throw new Error(
                    "Impossible de récupérer les informations utilisateur.",
                );
            }

            const callbackUrl = searchParams.get("callbackUrl");

            const safeCallback =
                callbackUrl &&
                    callbackUrl.startsWith("/") &&
                    !callbackUrl.startsWith("//") &&
                    !callbackUrl.includes("\\")
                    ? callbackUrl
                    : "/dashboard-radio";

            // 1. Le compte est connecté, mais pas encore activé.
            if (user.isActive === false) {
                router.replace("/radio-request");
            }
            // 2. Super administrateur.
            else if (user.globalRole === "SUPER_ADMIN") {
                router.replace("/admin");
            }
            // 3. Autres utilisateurs.
            else {
                // Un utilisateur standard ne doit pas être envoyé
                // vers une route réservée à l'administration.
                const isAdminCallback =
                    safeCallback === "/admin" ||
                    safeCallback.startsWith("/admin/");

                router.replace(isAdminCallback ? "/dashboard-radio" : safeCallback);
            }

            router.refresh();



        } catch (err) {
            if (err instanceof AuthApiError) {
                if (err.status === 401) {
                    setError(t("invalidCredentials"));
                } else if (err.status === 403) {
                    if (err.code === "ACCOUNT_DISABLED") {
                        setError(t("accountDisabled"));
                    } else if (err.code === "EMAIL_NOT_VERIFIED") {
                        setError(t("emailNotVerified"));
                    } else {
                        setError(err.message || t("genericError"));
                    }
                } else {
                    setError(err.message || t("genericError"));
                }
            } else {
                setError(t("networkError"));
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl shadow-black/[0.04] sm:p-9">
            <div className="mb-8 space-y-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#F47B16]/10 text-[#F47B16]">
                    <LockKeyhole className="size-6" />
                </div>

                <h1 className="text-3xl font-bold tracking-tight">
                    {t("welcome")}
                </h1>

                <p className="text-sm leading-6 text-muted-foreground">
                    {t("loginDescription")}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                        {t("email")}
                    </label>

                    <div className="flex items-center gap-3 rounded-xl border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-[#F47B16]/40">
                        <Mail className="size-4 shrink-0 text-muted-foreground" />

                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder={t("emailPlaceholder")}
                            aria-invalid={Boolean(fieldErrors.email)}
                            aria-describedby={fieldErrors.email ? "email-error" : undefined}
                            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
                        />
                    </div>

                    {fieldErrors.email && (
                        <p id="email-error" className="text-sm text-destructive">
                            {fieldErrors.email}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                        <label htmlFor="password" className="text-sm font-medium">
                            {t("password")}
                        </label>

                        <Link
                            href="/forgot-password"
                            className="text-xs font-medium text-[#F47B16] hover:underline"
                        >
                            {t("forgotPassword")}
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-[#F47B16]/40">
                        <LockKeyhole className="size-4 shrink-0 text-muted-foreground" />

                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder={t("passwordPlaceholder")}
                            aria-invalid={Boolean(fieldErrors.password)}
                            aria-describedby={
                                fieldErrors.password ? "password-error" : undefined
                            }
                            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                        </button>
                    </div>

                    {fieldErrors.password && (
                        <p id="password-error" className="text-sm text-destructive">
                            {fieldErrors.password}
                        </p>
                    )}
                </div>

                {error && (
                    <p
                        role="alert"
                        className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
                    >
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-[#F47B16] px-4 text-sm font-semibold text-white transition hover:bg-[#df6b0d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? t("loggingIn") : t("login")}
                </button>

            </form>
            <div className="mt-7 space-y-3 text-center text-sm text-muted-foreground">
                <p>
                    {t("forgotPassword")}{" "}
                    <Link
                        href="/forgot-password"
                        className="font-semibold text-[#F47B16] hover:underline"
                    >
                        {t("resetPassword")}
                    </Link>
                </p>

                <p>
                    {t("noAccount")}{" "}
                    <Link
                        href="/register"
                        className="font-semibold text-[#087C3C] hover:underline"
                    >
                        {t("createAccount")}
                    </Link>
                </p>
            </div>
        </div>
    );
}