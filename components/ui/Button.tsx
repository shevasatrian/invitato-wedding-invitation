import Link from "next/link";

/**
 * Tombol dengan dua tampilan:
 *   solid   - latar abu gelap, teks putih (aksi utama: Submit, See Location)
 *   outline - transparan bergaris (aksi sekunder: Open via Instagram)
 *
 * Bisa dipakai sebagai <button> maupun sebagai tautan. Kalau prop `href`
 * diisi, komponen ini merender tautan; kalau tidak, ia merender tombol.
 * Tampilannya tetap sama persis di kedua kasus.
 */

type Variant = "solid" | "outline";

const base =
  "inline-flex items-center justify-center gap-2 px-7 py-2.5 font-body text-sm " +
  "tracking-[0.12em] uppercase transition-colors duration-300 " +
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  solid: "bg-stone text-white hover:bg-ink",
  outline: "border border-ink/40 text-ink hover:border-ink hover:bg-ink/5",
};

type CommonProps = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

type Props = CommonProps &
  (
    | ({ href: string; external?: boolean } & Omit<
        React.ComponentPropsWithoutRef<"a">,
        keyof CommonProps | "href"
      >)
    | ({ href?: undefined } & Omit<
        React.ComponentPropsWithoutRef<"button">,
        keyof CommonProps
      >)
  );

export default function Button({
  children,
  variant = "solid",
  className = "",
  ...props
}: Props) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (props.href !== undefined) {
    const { href, external, ...rest } = props;

    // Tautan ke luar situs (Instagram, Google Maps, Google Calendar) dibuka
    // di tab baru. `noreferrer` mencegah halaman tujuan tahu asal klik.
    return (
      <Link
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
