"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { authApi } from "@/lib/auth-api";
import { createVerifyEmailSchema } from "@/lib/validations/auth.schema";

export default function VerifyEmailPage() {
  const t = useTranslations("VerifyEmail");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem(
      "afriwave_pending_verification_email",
    );

    if (pendingEmail) {
      setEmail(pendingEmail);
    }
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setTimeout(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const schema = createVerifyEmailSchema((key) => t(key));
    const validation = schema.safeParse({
      email: email.trim().toLowerCase(),
      otp,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? t("invalidCode"));
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.verifyEmail(
        validation.data.email,
        validation.data.otp,
      );

      setSuccess(result.message ?? t("verified"));
      sessionStorage.removeItem("afriwave_pending_verification_email");

      window.setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("verificationFailed"),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(t("emailRequired"));
      return;
    }

    setResendLoading(true);

    try {
      const result = await authApi.resendVerification(normalizedEmail);

      setSuccess(result.message ?? t("resent"));
      setResendCooldown(60);
      setOtp("");
      sessionStorage.setItem(
        "afriwave_pending_verification_email",
        normalizedEmail,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("resendFailed"),
      );
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-[#202923]">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl dark:bg-orange-500/15">
            ✉️
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#202923] dark:text-white">
            {t("title")}
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {t("description")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              {t("emailLabel")}
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={loading || resendLoading}
              className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 outline-none transition focus:border-[#F47B16] focus:ring-2 focus:ring-orange-500/20 disabled:opacity-70 dark:border-gray-600"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label
              htmlFor="otp"
              className="mb-2 block text-sm font-medium"
            >
              {t("codeLabel")}
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              aria-describedby="otp-help"
              disabled={loading || resendLoading}
              className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none transition focus:border-[#F47B16] focus:ring-2 focus:ring-orange-500/20 disabled:opacity-70 dark:border-gray-600"
              placeholder="000000"
            />

            <p
              id="otp-help"
              className="mt-2 text-xs text-gray-500 dark:text-gray-400"
            >
              {t("codeHelp")}
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              resendLoading ||
              otp.length !== 6 ||
              !email.trim()
            }
            className="w-full rounded-xl bg-[#F47B16] px-4 py-3 font-semibold text-white transition hover:bg-[#df6a0b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t("verifying") : t("submit")}
          </button>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={
              loading ||
              resendLoading ||
              resendCooldown > 0 ||
              !email.trim()
            }
            className="w-full rounded-xl border border-[#087C3C] px-4 py-3 font-semibold text-[#087C3C] transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/5"
          >
            {resendLoading
              ? t("resending")
              : resendCooldown > 0
                ? `${t("resendIn")} ${resendCooldown}s`
                : t("resendCode")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("spamHint")}
        </p>
      </div>
    </main>
  );
}