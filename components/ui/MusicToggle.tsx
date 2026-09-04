"use client";

import { useEffect, useRef, useState } from "react";
import { music } from "@/lib/config";

/**
 * Musik latar beserta tombol nyala/matinya.
 *
 * Browser melarang audio berbunyi sendiri sebelum ada interaksi dari
 * pengguna. Karena itu musik baru diputar setelah tamu menekan
 * "Open Invitation" — `shouldPlay` menjadi true tepat setelah klik itu,
 * sehingga pemutarannya masih terhitung sebagai hasil aksi pengguna.
 */
export default function MusicToggle({ shouldPlay }: { shouldPlay: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  // Kalau file musiknya gagal dimuat, tombol disembunyikan saja —
  // lebih baik tidak ada tombol daripada tombol yang ditekan tapi diam.
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (!shouldPlay) return;

    const audio = audioRef.current;
    if (!audio) return;

    // play() mengembalikan Promise yang bisa ditolak browser.
    // Kalau ditolak, tombol tetap ada dan tamu bisa menyalakannya manual.
    audio.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    );
  }, [shouldPlay]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={music.src}
        loop
        preload="auto"
        onError={() => setAvailable(false)}
      />

      {available && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Matikan musik" : "Nyalakan musik"}
          aria-pressed={playing}
          className="fixed bottom-5 left-[4.5rem] z-30 flex h-11 w-11 items-center justify-center rounded-full bg-charcoal/80 text-white backdrop-blur-sm transition-colors hover:bg-charcoal"
        >
          <MusicIcon muted={!playing} />
        </button>
      )}
    </>
  );
}

function MusicIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 11V3.5L12.5 2v7.5" />
      <circle cx="4.5" cy="11" r="1.5" />
      <circle cx="11" cy="9.5" r="1.5" />
      {/* Garis miring menandakan musik sedang mati. */}
      {muted && <path d="M2 14L14 2" />}
    </svg>
  );
}
