import InvitationShell from "@/components/InvitationShell";
import Invitation from "@/components/Invitation";
import Welcoming from "@/components/sections/Welcoming";
import CoupleProfile from "@/components/sections/CoupleProfile";
import Countdown from "@/components/sections/Countdown";
import EventDetails from "@/components/sections/EventDetails";
import LocationMap from "@/components/sections/LocationMap";
import Rsvp from "@/components/sections/Rsvp";
import Gallery from "@/components/sections/Gallery";
import Wishes from "@/components/sections/Wishes";
import Footer from "@/components/sections/Footer";
import { dictionaries, pickLang } from "@/lib/i18n";

/**
 * Halaman undangan. Isinya hanya susunan section, tanpa logika —
 * urutan di sini persis urutan yang dilihat tamu saat men-scroll.
 *
 * `searchParams` dipakai untuk dua hal, dan keduanya tinggal di URL supaya
 * ikut terbawa saat tautan dibagikan:
 *
 *   ?to=Budi%20Santoso  menyapa tamu dengan namanya di halaman sampul
 *   ?lang=id            menampilkan seluruh undangan dalam Bahasa Indonesia
 *
 * Sejak Next.js 16 nilainya berupa Promise, jadi harus di-`await`.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ to?: string; lang?: string }>;
}) {
  const { to, lang: rawLang } = await searchParams;

  const lang = pickLang(rawLang);
  const t = dictionaries[lang];
  const guestName = to?.trim() || undefined;

  return (
    <InvitationShell lang={lang}>
      <Invitation t={t} lang={lang} guestName={guestName}>
        <Welcoming />
        <CoupleProfile />
        <Countdown />
        <EventDetails />
        <LocationMap />
        <Rsvp />
        <Gallery />
        <Wishes />
        <Footer />
      </Invitation>
    </InvitationShell>
  );
}
