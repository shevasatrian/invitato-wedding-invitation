/**
 * Mengubah asset pack mentah (11 PNG/JPG, ~19 MB) menjadi WebP siap pakai
 * di public/images (~2 MB).
 *
 * Jalankan dengan: npm run optimize-images
 *
 * Kenapa perlu:
 *   - File asli berukuran 1,6-2,5 MB per gambar. Kalau dipakai apa adanya,
 *     tamu yang membuka undangan lewat kuota HP harus mengunduh ~19 MB.
 *   - WebP rata-rata 8-10x lebih kecil dari PNG pada kualitas visual yang sama.
 *   - Nama file asli (1.png, 2.png, ...) tidak menjelaskan isinya. Di sini
 *     sekalian diberi nama yang bermakna supaya kode section mudah dibaca.
 *
 * Asset mentah tidak ikut ter-commit (lihat .gitignore). Yang masuk repo
 * hanya hasil optimasinya, dan script ini supaya bisa dibuat ulang kapan saja.
 */

import sharp from "sharp";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

const SOURCE_DIR = "assets";
const OUTPUT_DIR = path.join("public", "images");

/**
 * Peta asset. `maxWidth` disesuaikan dengan ukuran tampil terbesarnya di
 * halaman (dikali ~2 untuk layar retina) — tidak ada gunanya menyimpan foto
 * 1537px kalau di layar cuma tampil selebar 480px.
 */
const IMAGES = [
  // Foto pembuka: tampil full-bleed di mobile dan mengisi panel kiri desktop.
  { from: "4.png", to: "cover", maxWidth: 1080 },

  // Foto di section Welcoming.
  { from: "3.png", to: "welcoming", maxWidth: 1000 },

  // Kartu mempelai — masing-masing tampil selebar kolom undangan.
  { from: "5.png", to: "groom", maxWidth: 1000 },
  { from: "6.png", to: "bride", maxWidth: 1000 },

  // Foto besar di belakang Countdown dan Footer.
  { from: "10.png", to: "moment", maxWidth: 1600 },

  // Galeri.
  { from: "1.png", to: "gallery-1", maxWidth: 1200 },
  { from: "2.png", to: "gallery-2", maxWidth: 1200 },
  { from: "7.png", to: "gallery-3", maxWidth: 1200 },
  { from: "8.png", to: "gallery-4", maxWidth: 1200 },
  { from: "9.png", to: "gallery-5", maxWidth: 1200 },

  // Tekstur kain sutra, dipakai sebagai latar belakang halus.
  { from: "background.jpg", to: "texture", maxWidth: 1000, quality: 72 },
];

const DEFAULT_QUALITY = 80;

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function main() {
  // Pastikan asset mentahnya ada sebelum mulai.
  let available;
  try {
    available = await readdir(SOURCE_DIR);
  } catch {
    console.error(
      `Folder "${SOURCE_DIR}/" tidak ditemukan.\n` +
        `Asset pack Invitato tidak ikut ter-commit ke repo. ` +
        `Salin isinya ke folder ${SOURCE_DIR}/ lalu jalankan ulang perintah ini.`,
    );
    process.exit(1);
  }

  const missing = IMAGES.filter((image) => !available.includes(image.from));
  if (missing.length > 0) {
    console.error(
      `File berikut tidak ada di ${SOURCE_DIR}/: ` +
        missing.map((image) => image.from).join(", "),
    );
    process.exit(1);
  }

  await mkdir(OUTPUT_DIR, { recursive: true });

  let totalBefore = 0;
  let totalAfter = 0;

  for (const image of IMAGES) {
    const source = path.join(SOURCE_DIR, image.from);
    const target = path.join(OUTPUT_DIR, `${image.to}.webp`);

    await sharp(source)
      // withoutEnlargement: kalau file asli lebih kecil dari maxWidth,
      // biarkan apa adanya. Memperbesar gambar hanya menambah ukuran file
      // tanpa menambah detail.
      .resize({ width: image.maxWidth, withoutEnlargement: true })
      .webp({ quality: image.quality ?? DEFAULT_QUALITY })
      .toFile(target);

    const before = (await stat(source)).size;
    const after = (await stat(target)).size;
    totalBefore += before;
    totalAfter += after;

    const saved = Math.round((1 - after / before) * 100);
    console.log(
      `${image.from.padEnd(15)} -> ${`${image.to}.webp`.padEnd(18)} ` +
        `${formatSize(before)} -> ${formatSize(after)}  (-${saved}%)`,
    );
  }

  console.log(
    `\nTotal: ${formatSize(totalBefore)} -> ${formatSize(totalAfter)} ` +
      `(-${Math.round((1 - totalAfter / totalBefore) * 100)}%)`,
  );
}

main();
