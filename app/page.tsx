import InvitationShell from "@/components/InvitationShell";
import Invitation from "@/components/Invitation";
import Welcoming from "@/components/sections/Welcoming";
import CoupleProfile from "@/components/sections/CoupleProfile";
import Countdown from "@/components/sections/Countdown";
import EventDetails from "@/components/sections/EventDetails";
import LocationMap from "@/components/sections/LocationMap";
import Gallery from "@/components/sections/Gallery";
import Footer from "@/components/sections/Footer";

/**
 * Halaman undangan. Isinya hanya susunan section, tanpa logika —
 * urutan di sini persis urutan yang dilihat tamu saat men-scroll.
 *
 * `searchParams` dipakai untuk personalisasi: tautan seperti
 * `/?to=Budi%20Santoso` akan menyapa tamu dengan namanya di halaman sampul.
 * Sejak Next.js 16 nilainya berupa Promise, jadi harus di-`await`.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const { to } = await searchParams;

  return (
    <InvitationShell>
      <Invitation guestName={to?.trim() || undefined}>
        <Welcoming />
        <CoupleProfile />
        <Countdown />
        <EventDetails />
        <LocationMap />
        <Gallery />
        <Footer />
      </Invitation>
    </InvitationShell>
  );
}
