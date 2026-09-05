"use client";

import { useEffect, useState } from "react";
import CoupleNames from "@/components/ui/CoupleNames";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { couple, navLinks } from "@/lib/config";
import type { Dict, Lang } from "@/lib/i18n";

/**
 * Menu melayang di kiri bawah. Menekannya membuka panel gelap dari kanan
 * berisi tautan ke tiap section.
 *
 * Tautannya `<a href="#id">` biasa — perpindahan halusnya datang dari
 * `scroll-behavior: smooth` di globals.css, bukan dari JavaScript.
 */
export default function NavDrawer({
  t,
  lang,
  guestName,
}: {
  t: Dict;
  lang: Lang;
  guestName?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.nav.open}
        aria-expanded={open}
        className="fixed bottom-5 left-5 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-charcoal/80 text-white backdrop-blur-sm transition-colors hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span aria-hidden="true" className="space-y-[5px]">
          <span className="block h-px w-4 bg-current" />
          <span className="block h-px w-4 bg-current" />
          <span className="block h-px w-4 bg-current" />
        </span>
      </button>

      {/* Latar gelap. Diberi pointer-events-none saat tertutup supaya tidak
          menghalangi klik pada halaman di baliknya. */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-charcoal/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <nav
        aria-label={t.nav.menu}
        // inert menyembunyikan panel dari pembaca layar dan navigasi Tab
        // selama tertutup, walaupun elemennya masih ada di DOM.
        inert={!open}
        className={`fixed top-0 right-0 z-50 flex h-full w-[min(20rem,80vw)] flex-col justify-between bg-ink p-8 transition-transform duration-500 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-start justify-between">
            <p className="font-display text-xl tracking-[0.05em] text-white uppercase">
              <CoupleNames t={t} andClassName="mx-1.5 text-lg" />
            </p>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.nav.close}
              className="-mt-2 p-2 font-ui text-2xl text-white/70 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              &times;
            </button>
          </div>

          <ul className="mt-10">
            {navLinks.map((link) => (
              <li key={link.id} className="border-b border-white/20">
                <a
                  href={`#${link.id}`}
                  onClick={() => setOpen(false)}
                  className="block py-4 text-right font-display text-base tracking-[0.12em] text-white/90 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {t.nav[link.id]}
                </a>
              </li>
            ))}
          </ul>

          {/* Berpindah bahasa dari sini aman: state `opened` dan posisi
              scroll terbukti bertahan (diukur, bukan diduga — lihat
              docs/superpowers/plans, Task 1). */}
          <div className="mt-10 flex items-center justify-end gap-3">
            <span className="font-ui text-[0.6rem] tracking-[0.25em] text-white/60 uppercase">
              {t.language.label}
            </span>
            <LanguageToggle lang={lang} guestName={guestName} t={t} />
          </div>
        </div>

        <p className="text-right font-body text-xs text-white/45">
          {couple.hashtag}
        </p>
      </nav>
    </>
  );
}
