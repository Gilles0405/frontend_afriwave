
"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type RadioRequestForm = {
  name: string;
  description: string;
  frequency: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  facebook: string;
  instagram: string;
  youtube: string;
  streamUrl: string;
};

const initialForm: RadioRequestForm = {
  name: "",
  description: "",
  frequency: "",
  city: "",
  country: "Cameroun",
  address: "",
  phone: "",
  email: "",
  website: "",
  facebook: "",
  instagram: "",
  youtube: "",
  streamUrl: "",
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#F47B16] focus:ring-2 focus:ring-[#F47B16]/15";

export default function RadioRequestPage() {
  const t = useTranslations("RadioRequest");
  const router = useRouter();

  const [form, setForm] = useState<RadioRequestForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function updateField(
    field: keyof RadioRequestForm,
    value: string,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.city.trim() ||
      !form.country.trim() ||
      !form.phone.trim() ||
      !form.email.trim()
    ) {
      setError(t("errors.required"));
      return;
    }

    setLoading(true);

    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [
          key,
          value.trim(),
        ]),
      );

      const response = await fetch("/api/radio-requests/create", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success !== true) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        throw new Error(
          result?.message || t("errors.submit"),
        );
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("errors.submit"),
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-[#F7F8F6] px-4 py-12">
        <section className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl text-[#087C3C]">
            ✓
          </div>

          <h1 className="text-2xl font-bold text-[#202923]">
            {t("success.title")}
          </h1>

          <p className="mt-3 leading-7 text-gray-600">
            {t("success.description")}
          </p>

          <div className="mt-6 rounded-xl bg-[#F7F8F6] p-4 text-sm text-gray-600">
            {t("success.notice")}
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-7 w-full rounded-xl bg-[#087C3C] px-5 py-3 font-semibold text-white transition hover:bg-[#066631]"
          >
            {t("success.home")}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8F6] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-medium text-[#F47B16]">
            <span className="h-2 w-2 rounded-full bg-[#F47B16]" />
            {t("eyebrow")}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#202923] sm:text-4xl">
            {t("title")}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
            {t("description")}
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8"
        >
          <section>
            <h2 className="text-lg font-semibold text-[#202923]">
              {t("sections.identity")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {t("sections.identityDescription")}
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  {t("fields.name")} *
                </span>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder={t("placeholders.name")}
                  required
                  maxLength={150}
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  {t("fields.description")} *
                </span>
                <textarea
                  className={inputClass}
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  placeholder={t("placeholders.description")}
                  rows={4}
                  required
                  maxLength={2000}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  {t("fields.frequency")}
                </span>
                <input
                  className={inputClass}
                  value={form.frequency}
                  onChange={(e) =>
                    updateField("frequency", e.target.value)
                  }
                  placeholder={t("placeholders.frequency")}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  {t("fields.city")} *
                </span>
                <input
                  className={inputClass}
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder={t("placeholders.city")}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  {t("fields.country")} *
                </span>
                <input
                  className={inputClass}
                  value={form.country}
                  onChange={(e) =>
                    updateField("country", e.target.value)
                  }
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  {t("fields.address")}
                </span>
                <input
                  className={inputClass}
                  value={form.address}
                  onChange={(e) =>
                    updateField("address", e.target.value)
                  }
                  placeholder={t("placeholders.address")}
                />
              </label>
            </div>
          </section>

          <div className="border-t border-gray-100" />

          <section>
            <h2 className="text-lg font-semibold text-[#202923]">
              {t("sections.contact")}
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  {t("fields.email")} *
                </span>
                <input
                  className={inputClass}
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder={t("placeholders.email")}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  {t("fields.phone")} *
                </span>
                <input
                  className={inputClass}
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+237 ..."
                  required
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  {t("fields.website")}
                </span>
                <input
                  className={inputClass}
                  type="url"
                  value={form.website}
                  onChange={(e) =>
                    updateField("website", e.target.value)
                  }
                  placeholder="https://..."
                />
              </label>
            </div>
          </section>

          <div className="border-t border-gray-100" />

          <section>
            <h2 className="text-lg font-semibold text-[#202923]">
              {t("sections.digital")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {t("sections.digitalDescription")}
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {(
                [
                  ["facebook", "Facebook"],
                  ["instagram", "Instagram"],
                  ["youtube", "YouTube"],
                  ["streamUrl", "Stream URL"],
                ] as const
              ).map(([field, label]) => (
                <label key={field} className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    {label}
                  </span>
                  <input
                    className={inputClass}
                    type="url"
                    value={form[field]}
                    onChange={(e) => updateField(field, e.target.value)}
                    placeholder={
                      field === "streamUrl"
                        ? "https://.../stream"
                        : "https://..."
                    }
                  />
                </label>
              ))}
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="rounded-xl bg-[#F7F8F6] p-4 text-sm leading-6 text-gray-600">
            {t("reviewNotice")}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F47B16] px-6 py-3.5 font-semibold text-white transition hover:bg-[#dd690b] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? t("submitting") : t("submit")}
            {!loading && <span aria-hidden="true">→</span>}
          </button>
        </form>
      </div>
    </main>
  );
}
