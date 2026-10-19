"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import "../not-found.css";

export default function NotFound() {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] === "en" ? "en" : "fr";
  const [showMessage, setShowMessage] = useState(false);

  const text =
    locale === "en"
      ? {
          status: "PAGE NOT FOUND",
          title: "Oops! This page doesn't exist.",
          description:
            "The page may have been moved, deleted, or the address may be incorrect.",
          home: "Back to homepage",
          back: "Previous page",
          tagline: "Connecting Africa through stories and media.",
        }
      : {
          status: "PAGE INTROUVABLE",
          title: "Oups ! Cette page n'existe pas.",
          description:
            "La page recherchée a peut-être été déplacée ou supprimée, ou l'adresse saisie est incorrecte.",
          home: "Retour à l'accueil",
          back: "Page précédente",
          tagline: "Connecter l'Afrique par les histoires et les médias.",
        };

  return (
    <main className="afriwave-404">
      <div className="afriwave-404__glow afriwave-404__glow--orange" />
      <div className="afriwave-404__glow afriwave-404__glow--green" />

      <section className="afriwave-404__content">
        <Link
          href={`/${locale}`}
          className="afriwave-404__brand"
          aria-label="AfriWave - Accueil"
        >
          <Image
            src="/WhatsApp_Image_2026-10-10_at_20.27.03-removebg-preview.png"
            alt="AfriWave"
            width={110}
            height={110}
            priority
            className="afriwave-404__logo"
          />
        </Link>

        <p className="afriwave-404__status">
          <span className="afriwave-404__status-dot" />
          {text.status}
        </p>

        <div className="afriwave-404__number" aria-label="404">
          <span>4</span>
          <span>0</span>
          <span>4</span>
        </div>

        <div className="afriwave-404__separator">
          <span />
        </div>

        <h1 className="afriwave-404__title">{text.title}</h1>

        <p className="afriwave-404__description">
          {text.description}
        </p>

        <div className="afriwave-404__actions">
          <Link href={`/${locale}`} className="afriwave-404__button afriwave-404__button--primary">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z" />
            </svg>
            {text.home}
            <span className="afriwave-404__arrow">→</span>
          </Link>

          <button
            type="button"
            className="afriwave-404__button afriwave-404__button--secondary"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                setShowMessage(true);
              }
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 12H5m7 7-7-7 7-7" />
            </svg>
            {text.back}
          </button>
        </div>

        {showMessage && (
          <p className="afriwave-404__notice" role="status">
            {locale === "en"
              ? "No previous page is available. Use the homepage button."
              : "Aucune page précédente disponible. Utilisez le bouton d'accueil."}
          </p>
        )}

        <footer className="afriwave-404__footer">
          <span className="afriwave-404__footer-line" />
          <p>AfriWave</p>
          <span>{text.tagline}</span>
        </footer>
      </section>
    </main>
  );
}