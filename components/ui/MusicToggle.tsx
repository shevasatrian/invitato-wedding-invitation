/**
 * Tombol nyala/matikan musik.
 *
 * Komponen ini sengaja tidak menyimpan state maupun memegang elemen <audio>.
 * Keduanya ada di components/Invitation.tsx, karena musik harus mulai tepat
 * di dalam penanganan klik "Open Invitation" — lihat penjelasannya di sana.
 * Di sini hanya urusan tampilan.
 */
export default function MusicToggle({
  playing,
  onToggle,
}: {
  playing: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? "Matikan musik" : "Nyalakan musik"}
      aria-pressed={playing}
      className="fixed bottom-5 left-[4.5rem] z-30 flex h-11 w-11 items-center justify-center rounded-full bg-charcoal/80 text-white backdrop-blur-sm transition-colors hover:bg-charcoal"
    >
      <MusicIcon muted={!playing} />
    </button>
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
