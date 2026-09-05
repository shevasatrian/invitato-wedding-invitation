import { dictionaries } from "@/lib/i18n";

const ID = dictionaries.id;
const EN = dictionaries.en;

import { describe, expect, it } from "vitest";

import {
  formatEventDate,
  getTimeLeft,
  googleCalendarUrl,
  mapEmbedUrl,
  mapLinkUrl,
  pad,
  timeAgo,
} from "@/lib/utils";

/**
 * Semua fungsi di `lib/utils.ts` adalah fungsi murni: input sama selalu
 * memberi output sama, tanpa menyentuh jaringan atau database.
 *
 * Karena itu `getTimeLeft` dan `timeAgo` menerima parameter `now`. Tanpa itu
 * keduanya akan membaca jam komputer, dan test-nya akan memberi hasil berbeda
 * setiap kali dijalankan. Di sini `now` selalu diisi tanggal tetap.
 */

const NOW = new Date("2026-09-04T10:00:00Z");

describe("getTimeLeft", () => {
  it("memecah selisih waktu jadi hari, jam, menit, detik", () => {
    const target = new Date("2026-09-06T13:30:45Z"); // 2 hari 3 jam 30 menit 45 detik

    expect(getTimeLeft(target, NOW)).toEqual({
      days: 2,
      hours: 3,
      minutes: 30,
      seconds: 45,
      isOver: false,
    });
  });

  it("memberi angka nol semua kalau acaranya sudah lewat", () => {
    const kemarin = new Date("2026-09-03T10:00:00Z");

    expect(getTimeLeft(kemarin, NOW)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isOver: true,
    });
  });

  it("tepat di detik acara dimulai sudah dihitung lewat", () => {
    expect(getTimeLeft(NOW, NOW).isOver).toBe(true);
  });
});

describe("pad", () => {
  it("menambah nol di depan angka satu digit", () => {
    expect(pad(9)).toBe("09");
  });

  it("membiarkan angka dua digit apa adanya", () => {
    expect(pad(42)).toBe("42");
  });
});

describe("timeAgo", () => {
  const menitLalu = (menit: number) =>
    new Date(NOW.getTime() - menit * 60 * 1000);

  it("kurang dari satu menit disebut 'baru saja'", () => {
    expect(timeAgo(menitLalu(0.5), NOW, ID)).toBe("baru saja");
  });

  it("menghitung dalam menit", () => {
    expect(timeAgo(menitLalu(5), NOW, ID)).toBe("5 menit lalu");
  });

  it("menghitung dalam jam", () => {
    expect(timeAgo(menitLalu(3 * 60), NOW, ID)).toBe("3 jam lalu");
  });

  it("menghitung dalam hari", () => {
    expect(timeAgo(menitLalu(2 * 24 * 60), NOW, ID)).toBe("2 hari lalu");
  });

  it("lewat seminggu berganti jadi tanggal penuh", () => {
    // Dipilih pukul 05:00 UTC supaya tanggalnya tetap 26 Desember di zona
    // waktu mana pun, sehingga test ini tidak tergantung mesin yang menjalankan.
    const lama = new Date("2026-12-26T05:00:00Z");
    const jauhSetelahnya = new Date("2027-03-01T05:00:00Z");

    expect(timeAgo(lama, jauhSetelahnya, ID)).toMatch(/Desember 2026/);
  });
});

describe("googleCalendarUrl", () => {
  it("menulis waktu dalam format UTC yang diminta Google", () => {
    const url = googleCalendarUrl({
      title: "Wedding of Ricky & Fellycia",
      details: "Holy Matrimony",
      location: "Jakarta",
      startsAt: new Date("2026-12-26T04:00:00Z"),
      endsAt: new Date("2026-12-26T06:00:00Z"),
    });

    expect(url).toContain("dates=20261226T040000Z%2F20261226T060000Z");
    expect(url).toContain("action=TEMPLATE");
  });

  it("meng-encode spasi dan karakter khusus pada judul", () => {
    const url = googleCalendarUrl({
      title: "Ricky & Fellycia",
      details: "",
      location: "",
      startsAt: new Date("2026-12-26T04:00:00Z"),
      endsAt: new Date("2026-12-26T06:00:00Z"),
    });

    expect(url).toContain("text=Ricky+%26+Fellycia");
  });
});

describe("link peta", () => {
  it("membuat URL embed tanpa API key", () => {
    expect(mapEmbedUrl("Jl. Sudirman No. 1")).toBe(
      "https://www.google.com/maps?q=Jl.%20Sudirman%20No.%201&output=embed",
    );
  });

  it("membuat URL untuk dibuka di aplikasi Maps", () => {
    expect(mapLinkUrl("Jl. Sudirman No. 1")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Jl.%20Sudirman%20No.%201",
    );
  });
});

describe("formatEventDate", () => {
  it("selalu memakai zona Jakarta, bukan zona komputer yang menjalankan", () => {
    // 25 Des 21:00 UTC = 26 Des 04:00 WIB. Tanpa timeZone: "Asia/Jakarta",
    // hasilnya akan berbunyi 25 Desember di sebagian mesin.
    expect(formatEventDate(new Date("2026-12-25T21:00:00Z"), "en-GB")).toBe(
      "Saturday, 26 December 2026",
    );
  });

  it("mengikuti locale yang diberikan", () => {
    const d = new Date("2026-12-26T11:00:00+07:00");
    expect(formatEventDate(d, "en-GB")).toContain("December");
    expect(formatEventDate(d, "id-ID")).toContain("Desember");
  });
});

describe("timeAgo mengikuti kamus", () => {
  const menitLalu = (menit: number) => new Date(NOW.getTime() - menit * 60 * 1000);

  it("mengganti penanda {n} dengan angka sesungguhnya", () => {
    expect(timeAgo(menitLalu(5), NOW, ID)).toBe("5 menit lalu");
    expect(timeAgo(menitLalu(5), NOW, EN)).toBe("5 minutes ago");
  });

  it("tidak menyisakan penanda {n} di keluaran mana pun", () => {
    for (const t of [ID, EN]) {
      for (const menit of [0.5, 5, 120, 60 * 24 * 3]) {
        expect(timeAgo(menitLalu(menit), NOW, t)).not.toContain("{n}");
      }
    }
  });
});
