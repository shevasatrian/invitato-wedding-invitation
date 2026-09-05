"use client";

import { useEffect, useRef, useState } from "react";
import Cover from "@/components/sections/Cover";
import NavDrawer from "@/components/ui/NavDrawer";
import MusicToggle from "@/components/ui/MusicToggle";
import { music } from "@/lib/config";
import type { Dict, Lang } from "@/lib/i18n";

/**
 * Pemegang state tingkat halaman: undangan sudah dibuka atau belum, dan
 * musik sedang berbunyi atau tidak.
 *
 * Keduanya dikumpulkan di sini karena keduanya lahir dari satu klik yang
 * sama — tombol "Open Invitation". Ini juga alasan project tidak memerlukan
 * Context atau state manager.
 *
 * Section undangannya sendiri tetap Server Component; mereka masuk lewat
 * `children`, jadi tidak ikut terbundel ke JavaScript browser.
 */
export default function Invitation({
  t,
  lang,
  guestName,
  children,
}: {
  t: Dict;
  lang: Lang;
  guestName?: string;
  children: React.ReactNode;
}) {
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Kalau berkas musiknya gagal dimuat, tombolnya disembunyikan —
  // lebih baik tidak ada tombol daripada tombol yang ditekan tapi diam.
  const [musicAvailable, setMusicAvailable] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Selama sampul belum dibuka, halaman tidak bisa di-scroll —
    // inilah yang membuat sampul berfungsi sebagai gerbang.
    document.body.classList.toggle("scroll-locked", !opened);
    return () => document.body.classList.remove("scroll-locked");
  }, [opened]);

  const startMusic = () => {
    // play() mengembalikan Promise yang bisa ditolak browser.
    audioRef.current?.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    );
  };

  const handleOpen = () => {
    /**
     * Musik dimulai DI SINI, di dalam penanganan klik — bukan di useEffect.
     *
     * Browser hanya mengizinkan audio berbunyi sebagai buah dari interaksi
     * pengguna. Kalau play() dipanggil belakangan lewat useEffect, sebagian
     * browser (Safari terutama) sudah tidak menganggapnya bagian dari klik
     * tadi dan menolaknya dengan NotAllowedError.
     */
    startMusic();
    setOpened(true);

    // Beri satu frame agar kunci scroll benar-benar lepas sebelum
    // halaman diminta meluncur ke section sambutan.
    requestAnimationFrame(() => {
      document
        .getElementById("welcoming")
        ?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      startMusic();
    }
  };

  return (
    <>
      <Cover t={t} lang={lang} guestName={guestName} onOpen={handleOpen} />

      {children}

      {/**
       * preload="none" — berkas musiknya 4,4 MB, jauh lebih besar daripada
       * seluruh foto di undangan ini digabung. Dengan "auto", berkas itu
       * ikut terunduh begitu halaman dibuka, padahal tamu belum tentu
       * melanjutkan. Dengan "none", unduhan baru mulai saat play() dipanggil.
       */}
      <audio
        ref={audioRef}
        src={music.src}
        loop
        preload="none"
        onError={() => setMusicAvailable(false)}
      />

      {/* Tombol melayang baru muncul setelah undangan dibuka,
          supaya halaman sampul tetap bersih. */}
      {opened && (
        <>
          <NavDrawer t={t} lang={lang} guestName={guestName} />
          {musicAvailable && (
            <MusicToggle playing={playing} onToggle={toggleMusic} />
          )}
        </>
      )}
    </>
  );
}
