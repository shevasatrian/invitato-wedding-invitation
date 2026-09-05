"use client";

import Image from "next/image";
import { useEffect } from "react";

import type { Dict } from "@/lib/i18n";

type Photo = { src: string; alt: string };

/**
 * Penampil foto layar penuh.
 *
 * Dirender hanya saat `index` bukan null, jadi komponen induk cukup
 * menyimpan satu state: foto ke berapa yang sedang dibuka.
 */
export default function Lightbox({
  t,
  photos,
  index,
  onClose,
  onChange,
}: {
  t: Dict;
  photos: readonly Photo[];
  index: number | null;
  onClose: () => void;
  onChange: (nextIndex: number) => void;
}) {
  const isOpen = index !== null;

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onChange((index + 1) % photos.length);
      // + photos.length supaya hasilnya tidak negatif saat index = 0
      if (event.key === "ArrowLeft")
        onChange((index - 1 + photos.length) % photos.length);
    };

    // Kunci scroll halaman di belakang, supaya latar tidak ikut bergeser
    // saat tamu menggulir di dalam lightbox.
    document.body.classList.add("scroll-locked");
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.classList.remove("scroll-locked");
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, index, photos.length, onClose, onChange]);

  if (index === null) return null;

  const photo = photos[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/95 p-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t.lightbox.close}
        className="absolute top-5 right-5 z-10 p-2 font-ui text-2xl text-white/80 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        &times;
      </button>

      <NavButton
        t={t}
        side="left"
        onClick={() => onChange((index - 1 + photos.length) % photos.length)}
      />
      <NavButton
        t={t}
        side="right"
        onClick={() => onChange((index + 1) % photos.length)}
      />

      <Image
        src={photo.src}
        alt={photo.alt}
        width={1200}
        height={1200}
        sizes="100vw"
        // stopPropagation: klik pada fotonya sendiri tidak ikut menutup
        // lightbox — hanya klik pada latar gelap yang menutup.
        onClick={(event) => event.stopPropagation()}
        className="max-h-[85svh] w-auto object-contain"
      />

      <p className="absolute bottom-6 font-ui text-xs tracking-widest text-white/60">
        {index + 1} / {photos.length}
      </p>
    </div>
  );
}

function NavButton({
  side,
  onClick,
  t,
}: {
  side: "left" | "right";
  onClick: () => void;
  t: Dict;
}) {
  return (
    <button
      type="button"
      aria-label={side === "left" ? t.lightbox.previous : t.lightbox.next}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`absolute z-10 p-4 font-ui text-3xl text-white/70 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        side === "left" ? "left-1" : "right-1"
      }`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}
