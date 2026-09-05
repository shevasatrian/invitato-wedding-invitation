import qrcode from "qrcode-generator";

import Section, { SectionTitle } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Divider from "@/components/ui/Divider";
import CoupleNames from "@/components/ui/CoupleNames";
import { mapVenue, weddingDate } from "@/lib/config";
import { formatEventDate, invitationUrl } from "@/lib/utils";
import type { Dict, Lang } from "@/lib/i18n";

/**
 * Mengubah teks menjadi SATU path SVG.
 *
 * Library-nya hanya ditanya "kotak di baris ini kolom ini gelap atau tidak";
 * gambarnya kita susun sendiri. Dua alasan memilih cara ini: tidak perlu
 * `dangerouslySetInnerHTML`, dan satu `<path>` jauh lebih ringan daripada
 * ratusan `<rect>` terpisah — QR berukuran 33x33 berarti sampai 1089 elemen.
 *
 * Tipe 0 = ukuran ditentukan otomatis dari panjang teks. Level "M" menahan
 * kerusakan sampai sekitar 15%, cukup untuk kode yang dipindai dari layar.
 */
function qrPath(text: string): { d: string; size: number } {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();

  const size = qr.getModuleCount();
  let d = "";

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // Satu kotak 1x1 pada koordinat modulnya. viewBox yang mengatur skalanya.
      if (qr.isDark(row, col)) d += `M${col} ${row}h1v1h-1z`;
    }
  }

  return { d, size };
}

/**
 * Kartu undangan bergaya tiket masuk, meniru section "QR Card" pada template
 * referensi Invitato.
 *
 * QR-nya berisi tautan undangan ini lengkap dengan nama tamu. Fungsinya
 * dekoratif — tidak ada pemindaian di lokasi — tapi diisi tautan sungguhan
 * supaya tamu yang iseng memindainya mendapat sesuatu yang masuk akal.
 *
 * Server Component: `qrcode-generator` dijalankan saat merender di server dan
 * tidak pernah ikut ke JavaScript yang diunduh tamu.
 */
export default function AccessCard({
  t,
  lang,
  guestName,
}: {
  t: Dict;
  lang: Lang;
  guestName?: string;
}) {
  const { d, size } = qrPath(invitationUrl(guestName, lang));

  return (
    <Section id="access" className="bg-mist">
      <SectionTitle>{t.accessCard.title}</SectionTitle>

      <Reveal delay={100}>
        <p className="mt-5 text-center font-body text-lg text-ink/80">
          {t.accessCard.intro}
        </p>
      </Reveal>

      <Reveal delay={180}>
        <div className="mt-10 border border-ink/20 bg-cream px-6 py-10 text-center shadow-sm">
          <p className="font-ui text-[0.6rem] tracking-[0.3em] text-ink/80 uppercase">
            {t.accessCard.guest}
          </p>

          <p className="mt-3 font-display text-2xl tracking-[0.05em] text-ink">
            {guestName || t.accessCard.honoredGuest}
          </p>

          <Divider className="mt-7 text-ink/40" />

          {/* shapeRendering="crispEdges" mematikan penghalusan tepi: tanpa itu
              kotak-kotak QR jadi buram di ukuran kecil dan gagal dipindai. */}
          <svg
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={t.accessCard.qrAlt}
            shapeRendering="crispEdges"
            className="mx-auto mt-7 h-44 w-44 text-ink"
          >
            <path d={d} fill="currentColor" />
          </svg>

          <p className="mt-7 font-body text-base text-ink/80">
            {formatEventDate(weddingDate, t.locale)}
          </p>
          <p className="font-body text-base text-ink/80">{mapVenue.venue}</p>

          <p className="mt-5 font-display text-lg tracking-[0.08em] text-ink/85 uppercase">
            <CoupleNames t={t} andClassName="mx-1.5 text-base" />
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
