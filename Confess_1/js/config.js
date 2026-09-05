/**
 * CONFIG
 * Satu-satunya tempat yang perlu diedit untuk mengganti isi/nama.
 */
const CONFIG = {
  from: "Zerav",
  to: "Rinn",

  cover: {
    eyebrow: "sebuah pesan kecil",
    title: ["untuk kamu,", "yang belakangan ini", "sering di pikiran."],
    sub: "tenang, nggak akan lama. tap saja kalau sudah siap."
  },

  envelope: {
    hintTop: "bidik amplopnya",
    hintBottom: "geser buat mengarah, lepas buat nembak"
  },

  letter: {
    badge: "dari {from}, untuk {to}"
  },

  // setiap item = satu paragraf, akan diketik satu per satu
  confession: [
    "Aku nggak tahu harus nulis apa sebenarnya. Awalnya cuma kepikiran, “kenapa nggak aku tulis aja?” Jadi ya, ini aku tulis.",
    "Aku nggak tahu kamu sadar atau nggak, tapi akhir-akhir ini kamu jadi salah satu alasan kenapa hari-hariku terasa sedikit berbeda.",
    "Bukan karena kamu selalu melakukan sesuatu yang besar. Malah mungkin justru karena hal-hal kecil yang kamu lakukan tanpa kamu pikirin. Cara kamu cerita. Cara kamu merespons sesuatu. Obrolan yang mungkin buat kamu biasa aja, tapi entah kenapa bisa aku ingat lebih lama.",
    "Aku juga nggak mau bilang terlalu banyak. Takutnya malah jadi aneh. Aku cuma mau jujur kalau aku senang bisa kenal kamu.",
    "Dan kalau suatu saat kamu bertanya, “sebenarnya kenapa aku?” Mungkin jawabannya sederhana: karena dari sekian banyak orang yang aku temui, entah kenapa aku ingin tahu lebih banyak tentang kamu."
  ],

  question: {
    title: "boleh aku tahu, kamu juga merasa hal yang sama?",
    yes: "iya, aku juga 💗",
    wait: "beri aku waktu dulu",
    // muncul berurutan tiap kali tombol "wait" berhasil dihindari
    dodgeHints: [
      "coba lagi deh~",
      "yang bener yang mana hayo",
      "yaudah, nggak usah dihindarin~"
    ]
  },

  closing: {
    yesTitle: "Yeayy!! 💖",
    // ganti path ini ke foto asli lo — taruh filenya di folder assets/
    photo: "assets/closing-photo.jpg",
    yes: [
      "Yeayy. Nggak nyangka bakal secerah ini rasanya.",
      "Nggak usah buru-buru — pelan-pelan saja, sambil kita lihat ke mana ini berjalan."
    ],
    wait: [
      "Terima kasih sudah jujur, itu udah cukup berarti.",
      "Aku akan tetap di sini. Nggak ke mana-mana, dan nggak akan maksa."
    ]
  }
};
