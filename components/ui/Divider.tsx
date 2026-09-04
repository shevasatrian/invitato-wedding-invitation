/**
 * Ornamen pemisah antar bagian: belah ketupat kecil di dalam lingkaran,
 * diapit garis rambut. Meniru pemisah pada template referensi.
 */
export default function Divider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-4 ${className}`}
      // Murni hiasan — pembaca layar tidak perlu mengumumkannya.
      aria-hidden="true"
    >
      <span className="h-px w-12 bg-ink/25" />

      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="0.6" />
        <rect
          x="11"
          y="4.6"
          width="9"
          height="9"
          transform="rotate(45 11 4.6)"
          stroke="currentColor"
          strokeWidth="0.6"
        />
      </svg>

      <span className="h-px w-12 bg-ink/25" />
    </div>
  );
}
