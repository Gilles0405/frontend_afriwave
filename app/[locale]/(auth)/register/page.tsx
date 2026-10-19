"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  Eye,
  EyeOff,
  UserRound,
  Mail,
  LockKeyhole,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import {
  createRegisterSchema,
} from "@/lib/validations/auth.schema";
import {
  authApi,
  AuthApiError,
} from "@/lib/auth-api";

type RegisterFields = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] =
    useState<RegisterFields>({});

  const registerSchema = createRegisterSchema((key) => t(key));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const validation = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Partial<
        Record<keyof RegisterFields, string[]>
      >;

      setFieldErrors({
        firstName: errors.firstName?.[0],
        lastName: errors.lastName?.[0],
        email: errors.email?.[0],
        password: errors.password?.[0],
      });
      return;
    }

    setLoading(true);

    try {
      await authApi.register({
        ...validation.data,
      });

      // L'inscription ne connecte pas automatiquement l'utilisateur.
      // Le compte doit d'abord être vérifié par e-mail.
      sessionStorage.setItem(
        "afriwave_pending_verification_email",
        validation.data.email,
      );

      router.push("/verify-email");
    } catch (err) {
      if (err instanceof AuthApiError) {
        if (err.status === 409) {
          setError(t("emailAlreadyExists"));
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

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-[#202923] outline-none transition placeholder:text-gray-400 focus:border-[#F47B16] focus:ring-2 focus:ring-[#F47B16]/15 dark:border-white/10 dark:bg-white/5 dark:text-white";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F8F8F5] px-4 py-10 dark:bg-[#151B17]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#F47B16]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#087C3C]/10 blur-3xl"
      />

      <section className="relative w-full max-w-lg rounded-3xl border border-black/5 bg-white p-6 shadow-xl shadow-black/5 sm:p-9 dark:border-white/10 dark:bg-[#202923]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F47B16]/10 text-[#F47B16]">
            <UserRound size={28} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#202923] dark:text-white">
            {t("registerTitle")}
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-300">
            {t("registerSubtitle")}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-[#202923] dark:text-gray-100">
                {t("firstName")}
              </label>
              <input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                aria-invalid={Boolean(fieldErrors.firstName)}
                aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
                className={inputClass}
                placeholder={t("firstNamePlaceholder")}
              />
              {fieldErrors.firstName && (
                <p id="firstName-error" className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.firstName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-[#202923] dark:text-gray-100">
                {t("lastName")}
              </label>
              <input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                aria-invalid={Boolean(fieldErrors.lastName)}
                aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
                className={inputClass}
                placeholder={t("lastNamePlaceholder")}
              />
              {fieldErrors.lastName && (
                <p id="lastName-error" className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.lastName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#202923] dark:text-gray-100">
              {t("email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                className={`${inputClass} pl-11`}
                placeholder={t("emailPlaceholder")}
              />
            </div>
            {fieldErrors.email && (
              <p id="email-error" className="mt-1.5 text-xs text-red-600">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#202923] dark:text-gray-100">
              {t("password")}
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                className={`${inputClass} pl-11 pr-12`}
                placeholder={t("passwordPlaceholder")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:text-[#F47B16]"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p id="password-error" className="mt-1.5 text-xs text-red-600">
                {fieldErrors.password}
              </p>
            )}
            <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
              {t("passwordRequirements")}
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-[#202923] dark:text-gray-100">
              {t("confirmPassword")}
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
                className={`${inputClass} pl-11 pr-12`}
                placeholder={t("confirmPasswordPlaceholder")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? t("hidePassword") : t("showPassword")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:text-[#F47B16]"
              >
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p id="confirmPassword-error" className="mt-1.5 text-xs text-red-600">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F47B16] px-4 py-3.5 font-semibold text-white shadow-lg shadow-[#F47B16]/20 transition hover:bg-[#df6908] focus:outline-none focus:ring-2 focus:ring-[#F47B16] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={19} />
                {t("registerLoading")}
              </>
            ) : (
              <>
                {t("registerButton")}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-500 dark:text-gray-300">
          {t("alreadyHaveAccount")}{" "}
          <Link
            href="/login"
            className="font-semibold text-[#087C3C] transition hover:text-[#F47B16] dark:text-[#72D49A]"
          >
            {t("loginLink")}
          </Link>
        </p>
      </section>
    </main>
  );
}
