# sebuah pesan — versi romance

Tema hangat & personal, terinspirasi dari interaksi "bidik amplop lalu tembak" ala video referensi — tapi dibangun ulang sebagai kode sendiri: vanilla HTML/CSS/JS, tanpa backend, tanpa build step.

## Struktur

```
index.html         struktur & urutan scene
css/styles.css      visual: palet warna, tipografi, animasi hati, amplop, kartu surat
js/config.js        SATU-SATUNYA tempat untuk edit nama & teks
js/main.js          logika flow (bow & arrow, typewriter, carousel surat, dll)
assets/favicon.svg  ikon tab
assets/music.mp3    placeholder musik latar — ganti dengan file lagu asli
assets/closing-photo.jpg  foto di scene penutup (kalau jawabannya "iya")
netlify.toml        konfigurasi deploy
```

## Cara mengedit isi

Buka `js/config.js` — semua nama, judul, dan paragraf confession ada di situ. Tidak perlu menyentuh file lain untuk ganti teks.

Untuk musik latar, timpa file `assets/music.mp3` dengan lagu pilihanmu (nama & lokasi file dibiarkan sama, jadi tidak perlu ubah kode). Musik mulai otomatis begitu pengguna tap pertama kali di halaman.

## Alur pengalaman

1. **Loader** — detak hati kecil, jeda singkat.
2. **Cover** — tap di mana saja untuk lanjut (musik latar mulai di sini).
3. **Envelope** — geser dari busur untuk mengarah & menarik anak panahnya, lepas untuk menembak amplopnya (posisi dihitung otomatis dari layout, jadi tetap akurat di ukuran layar apa pun).
4. **Letter** — paragraf confession dipecah jadi beberapa kartu yang diketik pelan-pelan, satu per satu. Geser kiri/kanan (atau tap dot di bawahnya) untuk pindah kartu setelah kartu itu selesai diketik, swipe ke atas di kartu terakhir untuk lanjut.
5. **Question** — satu pertanyaan, dua pilihan jujur.
6. **Closing** — penutup singkat sesuai jawaban. Kalau jawabannya "iya", ada sedikit hati melayang sebagai sentuhan manis — bukan reward screen besar.

## Menjalankan secara lokal

Script pakai `<script src>` biasa (bukan ES module), jadi bisa langsung dibuka dengan double-click `index.html`, tanpa server lokal.

## Deploy ke Netlify

1. Buka [app.netlify.com/drop](https://app.netlify.com/drop)
2. Seret folder ini ke halaman tersebut
3. Selesai — dapat URL langsung

(atau lewat Git: publish directory `.`, build command kosong — sudah diatur di `netlify.toml`)
