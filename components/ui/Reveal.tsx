"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Membuat isinya muncul perlahan (fade + naik sedikit) saat ter-scroll
 * ke dalam layar. Dipakai di hampir semua section.
 *
 * Cara kerjanya: IntersectionObserver — API bawaan browser yang memberi tahu
 * kita saat sebuah elemen masuk ke area pandang. Begitu masuk, kita nyalakan
 * state `visible`, dan CSS transition yang mengerjakan animasinya.
 *
 * Ini alasan project tidak memakai library animasi: kebutuhannya cuma ini,
 * dan versi manualnya hanya belasan baris.
 */
export default function Reveal({
  children,
  /** Jeda sebelum animasi mulai, dalam milidetik. Untuk memunculkan
   *  beberapa elemen berurutan, bukan serentak. */
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          // Animasinya cuma sekali. Setelah muncul, pengamatan dihentikan
          // supaya tidak ada pekerjaan sia-sia saat tamu scroll naik-turun.
          observer.disconnect();
        }
      },
      // Tunggu 15% elemen terlihat dulu, supaya animasi tidak terpicu
      // saat elemen baru menyembul sedikit di tepi layar.
      { threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
