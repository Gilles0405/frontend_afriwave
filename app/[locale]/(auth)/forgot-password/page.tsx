
"use client";

import { useState, type FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import { authApi, AuthApiError } from "@/lib/auth-api";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSubmitted(true);
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
            ✉
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#202923]">
            {submitted ? t("successTitle") : t("title")}
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            {submitted ? t("successDescription") : t("description")}
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800"
            >
              {t("successMessage")}
            </div>

            <Link
              href="/reset-password"
              className="flex w-full items-center justify-center rounded-lg bg-[#F47B16] px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              {t("continue")}
            </Link>

            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="w-full py-2 text-sm font-medium text-[#087C3C] hover:underline"
            >
              {t("useAnotherEmail")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#202923]"
              >
                {t("emailLabel")}
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("emailPlaceholder")}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-[#202923] outline-none transition placeholder:text-gray-400 focus:border-[#087C3C] focus:ring-2 focus:ring-green-100"
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
          </form>
        )}

      </section>
    </main>
  );
}
