
"use client";

import { useState, type FormEvent } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { authApi, AuthApiError } from "@/lib/auth-api";
import { useTranslations } from "next-intl";

export default function ResetPasswordPage() {
  const t = useTranslations("ResetPassword");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(
        email.trim().toLowerCase(),
        otp,
        password,
      );

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof AuthApiError
          ? err.message
          : t("genericError"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8F6] px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <Link
          href="/login"
          className="text-sm font-medium text-[#087C3C] hover:underline"
        >
          ← {t("backToLogin")}
        </Link>

        <div className="mt-8 mb-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-2xl">
            🔐
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#202923]">
            {success ? t("successTitle") : t("title")}
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            {success ? t("successDescription") : t("description")}
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
            >
              {t("successMessage")}
            </div>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full rounded-lg bg-[#087C3C] px-4 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              {t("goToLogin")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#202923]"
              >
                {t("emailLabel")}
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("emailPlaceholder")}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#087C3C] focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium text-[#202923]"
              >
                {t("otpLabel")}
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                minLength={6}
                required
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 tracking-[0.3em] outline-none focus:border-[#087C3C] focus:ring-2 focus:ring-green-100"
              />

              <p className="mt-1 text-xs text-gray-500">
                {t("otpHint")}
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#202923]"
              >
                {t("passwordLabel")}
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("passwordPlaceholder")}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#087C3C] focus:ring-2 focus:ring-green-100"
              />

              <p className="mt-1 text-xs text-gray-500">
                {t("passwordHint")}
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-[#202923]"
              >
                {t("confirmPasswordLabel")}
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder={t("confirmPasswordPlaceholder")}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#087C3C] focus:ring-2 focus:ring-green-100"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#F47B16] px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t("loading") : t("submit")}
            </button>

            <p className="text-center text-sm text-gray-600">
              {t("noCode")}{" "}
              <Link
                href="/forgot-password"
                className="font-medium text-[#087C3C] hover:underline"
              >
                {t("requestAnother")}
              </Link>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
