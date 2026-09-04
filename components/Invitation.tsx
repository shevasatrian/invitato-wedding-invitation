"use client";

import { useEffect, useState } from "react";
import Cover from "@/components/sections/Cover";
import NavDrawer from "@/components/ui/NavDrawer";
import MusicToggle from "@/components/ui/MusicToggle";

/**
 * Satu-satunya pemegang state tingkat halaman: undangan sudah dibuka atau belum.
 *
 * Tiga hal bergantung pada state itu — kunci scroll, tombol menu & musik,
 * dan mulainya musik — jadi ketiganya dikumpulkan di sini. Ini alasan
 * project tidak memerlukan Context atau state manager: statenya cuma satu.
 *
 * Section-section undangannya sendiri tetap Server Component; mereka dikirim
 * ke sini lewat `children`, jadi tidak ikut terbundel ke JavaScript browser.
 */
export default function Invitation({
  guestName,
  children,
}: {
  guestName?: string;
  children: React.ReactNode;
}) {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    // Selama sampul belum dibuka, halaman tidak bisa di-scroll —
    // inilah yang membuat sampul berfungsi sebagai gerbang.
    if (opened) {
      document.body.classList.remove("scroll-locked");
    } else {
      document.body.classList.add("scroll-locked");
    }

    return () => document.body.classList.remove("scroll-locked");
  }, [opened]);

  const handleOpen = () => {
    setOpened(true);

    // Beri satu frame agar kunci scroll benar-benar lepas sebelum
    // halaman diminta meluncur ke section sambutan.
    requestAnimationFrame(() => {
      document
        .getElementById("welcoming")
        ?.scrollIntoView({ behavior: "smooth" });
    });
  };

  return (
    <>
      <Cover guestName={guestName} onOpen={handleOpen} />

      {children}

      {/* Tombol melayang baru muncul setelah undangan dibuka, supaya
          halaman sampul tetap bersih. */}
      {opened && (
        <>
          <NavDrawer />
          <MusicToggle shouldPlay={opened} />
        </>
      )}
    </>
  );
}
