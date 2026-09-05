/**
 * main.js
 * Flow: loader -> cover -> envelope (bow & arrow) -> letter -> question -> closing.
 * Tidak ada state yang dipersist — reload selalu kembali bersih ke awal.
 */

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

/* ---------------------------------------------------------
   Scene management
--------------------------------------------------------- */
const scenes = {
  loader: document.querySelector('[data-scene="loader"]'),
  cover: document.querySelector('[data-scene="cover"]'),
  envelope: document.querySelector('[data-scene="envelope"]'),
  letter: document.querySelector('[data-scene="letter"]'),
  question: document.querySelector('[data-scene="question"]'),
  closing: document.querySelector('[data-scene="closing"]')
};
const PROGRESS_ORDER = ["cover", "envelope", "letter", "question", "closing"];
const progressFill = document.getElementById("progressFill");

let current = "loader";

function goTo(name) {
  if (!scenes[name] || name === current) return;
  scenes[current].classList.remove("active");
  scenes[name].classList.add("active");
  current = name;

  const idx = PROGRESS_ORDER.indexOf(name);
  progressFill.style.width = idx < 0 ? "0%" : (idx / (PROGRESS_ORDER.length - 1)) * 100 + "%";

  if (name === "letter") playLetterTyping();
  if (name === "question") resetQuestionScene();
}

/* ---------------------------------------------------------
   Populate content from CONFIG
--------------------------------------------------------- */
function populate() {
  document.getElementById("coverEyebrow").textContent = CONFIG.cover.eyebrow;

  const titleEl = document.getElementById("coverTitle");
  titleEl.innerHTML = CONFIG.cover.title
    .map((line) => `<span class="line">${escapeHtml(line)}</span>`)
    .join("");
  const sub = document.createElement("p");
  sub.className = "cover-sub";
  sub.textContent = CONFIG.cover.sub;
  titleEl.insertAdjacentElement("afterend", sub);

  document.getElementById("envHintTop").textContent = CONFIG.envelope.hintTop;
  document.getElementById("envHintBottom").textContent = CONFIG.envelope.hintBottom;

  document.getElementById("letterBadge").textContent = CONFIG.letter.badge
    .replace("{from}", CONFIG.from)
    .replace("{to}", CONFIG.to);
  document.getElementById("letterStamp").textContent = `untuk ${CONFIG.to}, dari ${CONFIG.from}`;
  document.getElementById("letterSignature").textContent = `— ${CONFIG.from}`;

  document.getElementById("questionTitle").textContent = CONFIG.question.title;
  document.getElementById("choiceYes").textContent = CONFIG.question.yes;
  document.getElementById("choiceWait").textContent = CONFIG.question.wait;

  document.getElementById("closingSignature").textContent = `— ${CONFIG.from}`;
}

/* ---------------------------------------------------------
   Floating hearts (ambient, tasteful — bukan hujan hati)
--------------------------------------------------------- */
const heartsContainer = document.getElementById("hearts");
const heartColors = ["#ff8fae", "#ff6b95", "#ffb4c8", "#e5406c"];

function spawnHeart() {
  const h = document.createElement("span");
  h.className = "heart";
  const color = heartColors[Math.floor(Math.random() * heartColors.length)];
  h.style.background = color;
  h.style.left = Math.random() * 92 + "%";
  h.style.setProperty("--dx", Math.random() * 70 - 35 + "px");
  h.style.width = h.style.height = 8 + Math.random() * 8 + "px";
  h.style.animationDuration = 7 + Math.random() * 5 + "s";
  heartsContainer.appendChild(h);
  setTimeout(() => h.remove(), 13000);
}
// spawn ringan, tidak menumpuk: satu setiap ~1.3 detik
setInterval(spawnHeart, 1300);
for (let i = 0; i < 3; i++) setTimeout(spawnHeart, i * 400);

/* ---------------------------------------------------------
   Boot / loader
--------------------------------------------------------- */
async function boot() {
  populate();
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  await Promise.all([fontsReady, wait(850)]);
  goTo("cover");
}

/* ---------------------------------------------------------
   Musik latar — mulai saat interaksi pertama.
   Ada dua pemicu: tap di cover (utama), dan fallback pointerdown
   pertama di mana pun (jaga-jaga untuk in-app browser yang lebih ketat
   soal autoplay, mis. webview TikTok/Instagram/WhatsApp).
--------------------------------------------------------- */
const bgMusic = document.getElementById("bgMusic");
let musicStarted = false;

function startMusic() {
  if (musicStarted || !bgMusic) return;
  musicStarted = true;
  bgMusic.volume = 0.55;
  bgMusic.play().catch(() => {
    // browser masih nolak autoplay — biarkan interaksi berikutnya coba lagi
    musicStarted = false;
  });
}
document.addEventListener("pointerdown", startMusic, { once: true, passive: true });

/* ---------------------------------------------------------
   Cover — tap di mana saja
--------------------------------------------------------- */
scenes.cover.addEventListener("click", () => {
  startMusic();
  goTo("envelope");
});

/* ---------------------------------------------------------
   Envelope + bow — drag untuk mengarah, lepas untuk menembak
--------------------------------------------------------- */
const bowZone = document.getElementById("bowZone");
const bowSvg = document.getElementById("bowSvg");
const arrowSvg = document.getElementById("arrowSvg");
const envelope = document.getElementById("envelope");

const MAX_PULL = 60; // px, jarak tarik maksimum sebelum "mentok"
let aimDragging = false;
let aimStartX = 0, aimStartY = 0;
let shot = false;

function pointerXY(e) {
  if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}

function onAimStart(e) {
  if (shot || current !== "envelope") return;
  aimDragging = true;
  const p = pointerXY(e);
  aimStartX = p.x; aimStartY = p.y;
  // reset ke posisi awal biar setiap tarikan baru mulai bersih
  bowSvg.style.transform = "rotate(0deg) scale(1,1)";
  arrowSvg.style.transform = "translate(-50%, 0px) rotate(0deg)";
}
function onAimMove(e) {
  if (!aimDragging || shot) return;
  const p = pointerXY(e);
  const dx = p.x - aimStartX;
  const dy = p.y - aimStartY;
  const dist = Math.hypot(dx, dy);
  const pull = Math.min(dist, MAX_PULL);
  const ratio = pull / MAX_PULL;

  // arah tarikan asli (ternormalisasi), dipaksa condong ke bawah biar terasa "ditarik mundur"
  const dirX = dist ? dx / dist : 0;
  const dirY = dist ? Math.max(dy / dist, 0.2) : 1;
  const pullX = dirX * pull;
  const pullY = dirY * pull;

  const aimTilt = Math.max(Math.min(dx * 0.12, 16), -16);

  // busur "menegang" mengikuti kekuatan tarikan
  bowSvg.style.transform = `rotate(${aimTilt * 0.4}deg) scale(${1 + ratio * 0.05}, ${1 - ratio * 0.1})`;
  // anak panah ikut ketarik ke arah jari, plus sedikit miring buat kesan membidik
  arrowSvg.style.transform = `translate(calc(-50% + ${pullX}px), ${pullY}px) rotate(${aimTilt}deg)`;
  e.preventDefault();
}
function onAimEnd() {
  if (!aimDragging || shot) return;
  aimDragging = false;
  shot = true;
  fireArrow();
}

bowZone.addEventListener("mousedown", onAimStart);
bowZone.addEventListener("touchstart", onAimStart, { passive: true });
window.addEventListener("mousemove", onAimMove);
window.addEventListener("touchmove", onAimMove, { passive: false });
window.addEventListener("mouseup", onAimEnd);
window.addEventListener("touchend", onAimEnd);

function fireArrow() {
  // hitung posisi nyata amplop relatif ke busur, biar akurat di semua ukuran layar
  const bowRect = bowZone.getBoundingClientRect();
  const envRect = envelope.getBoundingClientRect();
  const dx = (envRect.left + envRect.width / 2) - (bowRect.left + bowRect.width / 2);
  const dy = (envRect.top + envRect.height / 2) - (bowRect.top + bowRect.height / 2);
  const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);

  bowSvg.style.transition = "transform .3s ease-out";
  bowSvg.style.transform = "rotate(0deg) scale(1,1)";

  arrowSvg.style.transition = "transform .5s cubic-bezier(.2,.7,.3,1), opacity .18s .34s";
  arrowSvg.style.transform = `translate(calc(${dx}px - 50%), ${dy}px) rotate(${angleDeg + 90}deg)`;
  arrowSvg.style.opacity = "0";

  setTimeout(() => envelope.classList.add("hit"), 460);
  setTimeout(() => goTo("letter"), 950);
}

/* ---------------------------------------------------------
   Letter — dipecah jadi beberapa kartu yang bisa di-swipe
   (satu paragraf = satu kartu, jadi jumlah kartu mengikuti isi confession).
   Tiap kartu diketik satu per satu; tap hanya bisa lanjut kalau
   kartu itu sudah selesai diketik (tidak ada skip-instan).
   Swipe kiri/kanan pindah kartu, swipe-up di kartu terakhir untuk lanjut.
--------------------------------------------------------- */
const letterTrack = document.getElementById("letterTrack");
const letterDots = document.getElementById("letterDots");
const letterCarousel = document.getElementById("letterCarousel");
const letterContinue = document.getElementById("letterContinue");
const letterBtn = document.getElementById("letterBtn");

const LETTER_CARD_COUNT = Math.max(1, (CONFIG.confession || []).length);
function chunkConfession(paragraphs, n) {
  const groups = [];
  const base = Math.floor(paragraphs.length / n);
  let extra = paragraphs.length % n;
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const size = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra--;
    if (size > 0) groups.push(paragraphs.slice(idx, idx + size));
    idx += size;
  }
  return groups;
}

let letterGroups = [];
let cardIndex = 0;
let cardTyped = [];
let typeTimer = null;

function buildLetterCards() {
  letterGroups = chunkConfession(CONFIG.confession || [], LETTER_CARD_COUNT);
  letterTrack.innerHTML = "";
  letterDots.innerHTML = "";
  cardTyped = letterGroups.map(() => false);

  letterGroups.forEach((_, i) => {
    const card = document.createElement("div");
    card.className = "letter-card";
    letterTrack.appendChild(card);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "letter-dot";
    dot.setAttribute("aria-label", `bagian ${i + 1}`);
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      // hanya pindah kalau memang beda kartu & kartu aktif sudah selesai diketik
      if (i !== cardIndex && cardTyped[cardIndex]) setCard(i);
    });
    letterDots.appendChild(dot);
  });
}

function updateDots() {
  [...letterDots.children].forEach((dot, i) => dot.classList.toggle("active", i === cardIndex));
}

// posisikan tiap kartu relatif terhadap kartu aktif (dipakai transform, bukan layout),
// jadi tinggi kontainer tidak ikut kebawa tinggi kartu lain yang sedang tidak tampil
function layoutCards() {
  [...letterTrack.children].forEach((card, i) => {
    card.style.transform = `translateX(${(i - cardIndex) * 100}%)`;
  });
}

// tinggi track mengikuti tinggi konten kartu yang sedang aktif saja
function updateTrackHeight() {
  const card = letterTrack.children[cardIndex];
  if (card) letterTrack.style.height = card.scrollHeight + "px";
}

function setCard(i) {
  cardIndex = Math.max(0, Math.min(i, letterGroups.length - 1));
  layoutCards();
  updateDots();
  updateTrackHeight();
  letterContinue.classList.remove("show");
  letterBtn.classList.remove("show");
  if (!cardTyped[cardIndex]) typeCard(cardIndex);
  else if (cardIndex === letterGroups.length - 1) showLetterEnd();
}

async function playLetterTyping() {
  buildLetterCards();
  if (!letterGroups.length) {
    // config.js kosong / salah isi — jangan sampai flow macet, langsung tampilkan lanjut
    showLetterEnd();
    return;
  }
  cardIndex = 0;
  layoutCards();
  updateDots();
  updateTrackHeight();
  await typeCard(cardIndex);
}

async function typeCard(i) {
  const card = letterTrack.children[i];
  if (!card) return;
  card.innerHTML = "";
  for (const paragraph of letterGroups[i]) {
    if (cardTyped[i]) break;
    const p = document.createElement("p");
    card.appendChild(p);
    await typeParagraph(p, paragraph, i);
    if (!cardTyped[i]) await wait(220);
  }
  cardTyped[i] = true;
  if (i === cardIndex && i === letterGroups.length - 1) showLetterEnd();
}

function typeParagraph(el, text, i) {
  return new Promise((resolve) => {
    let idx = 0;
    typeTimer = setInterval(() => {
      if (cardTyped[i]) { clearInterval(typeTimer); resolve(); return; }
      idx++;
      el.textContent = text.slice(0, idx);
      updateTrackHeight();
      if (idx >= text.length) { clearInterval(typeTimer); resolve(); }
    }, 42);
  });
}

function showLetterEnd() {
  letterContinue.classList.add("show");
  letterBtn.classList.add("show");
}

letterBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  goTo("question");
});

/* Tap kartu: hanya berfungsi kalau kartu sudah SELESAI diketik —
   lanjut ke kartu berikutnya, atau ke scene question kalau ini kartu terakhir.
   Kalau masih dalam proses ngetik, tap diabaikan (flow ketikan tetap jalan apa adanya). */
letterCarousel.addEventListener("click", () => {
  if (letterDragMoved) return;
  if (!cardTyped[cardIndex]) return;
  if (cardIndex < letterGroups.length - 1) setCard(cardIndex + 1);
  else goTo("question");
});

/* ---- drag / swipe horizontal untuk pindah kartu ---- */
let letterDragStartX = 0;
let letterDragging = false;
let letterDragMoved = false;

function letterPointerX(e) {
  return e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
}
function onLetterDragStart(e) {
  if (current !== "letter") return;
  letterDragging = true;
  letterDragMoved = false;
  letterDragStartX = letterPointerX(e);
  letterTrack.classList.add("dragging");
}
function onLetterDragMove(e) {
  if (!letterDragging) return;
  const dx = letterPointerX(e) - letterDragStartX;
  if (Math.abs(dx) > 6) letterDragMoved = true;
  letterTrack.style.transform = `translateX(${dx}px)`;
  if (Math.abs(dx) > 10) e.preventDefault();
}
function onLetterDragEnd(e) {
  if (!letterDragging) return;
  letterDragging = false;
  letterTrack.classList.remove("dragging");
  const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
  const dx = endX - letterDragStartX;
  const threshold = letterCarousel.offsetWidth * 0.18;

  let target = cardIndex;
  if (dx < -threshold && cardTyped[cardIndex] && cardIndex < letterGroups.length - 1) target = cardIndex + 1;
  else if (dx > threshold && cardIndex > 0) target = cardIndex - 1;

  letterTrack.style.transform = ""; // lepas offset drag, biarkan transform per-kartu yang menentukan posisi
  if (target !== cardIndex) setCard(target); // kalau tidak berubah, cukup "pegas" balik tanpa reset state lain
}
letterCarousel.addEventListener("mousedown", onLetterDragStart);
letterCarousel.addEventListener("touchstart", onLetterDragStart, { passive: true });
window.addEventListener("mousemove", onLetterDragMove);
window.addEventListener("touchmove", onLetterDragMove, { passive: false });
window.addEventListener("mouseup", onLetterDragEnd);
window.addEventListener("touchend", onLetterDragEnd);

/* swipe-up di luar carousel (badge/tombol/signature) untuk lanjut ke question */
let letterSwipeUpStartY = null;
scenes.letter.addEventListener("touchstart", (e) => {
  if (e.target.closest("#letterCarousel")) { letterSwipeUpStartY = null; return; }
  letterSwipeUpStartY = e.touches[0].clientY;
}, { passive: true });
scenes.letter.addEventListener("touchend", (e) => {
  if (letterSwipeUpStartY === null) return;
  const dy = e.changedTouches[0].clientY - letterSwipeUpStartY;
  letterSwipeUpStartY = null;
  const lastIndex = letterGroups.length - 1;
  if (lastIndex >= 0 && cardTyped[lastIndex] && cardIndex === lastIndex && dy < -40) goTo("question");
}, { passive: true });

/* ---------------------------------------------------------
   Question — tombol "wait" menghindar, tombol "yes" membesar
--------------------------------------------------------- */
let lastChoice = "yes";

const choicesZone = document.getElementById("choicesZone");
const choiceYesBtn = document.getElementById("choiceYes");
const choiceWaitBtn = document.getElementById("choiceWait");
const dodgeHint = document.getElementById("dodgeHint");
const DODGE_THRESHOLD = 60; // px, radius deteksi "terlalu deket"

let dodgeCount = 0;

function resetQuestionScene() {
  dodgeCount = 0;
  choiceWaitBtn.style.left = "50%";
  choiceWaitBtn.style.top = "64px";
  choiceWaitBtn.style.transform = "translate(-50%,0) scale(1)";
  choiceYesBtn.style.transform = "translateX(-50%) scale(1)";
  dodgeHint.textContent = "";
}

function dodgeWaitButton() {
  const zoneRect = choicesZone.getBoundingClientRect();
  const btnRect = choiceWaitBtn.getBoundingClientRect();
  const margin = 4;
  const maxLeft = Math.max(zoneRect.width - btnRect.width - margin, margin);
  const maxTop = Math.max(zoneRect.height - btnRect.height - margin, margin);
  const newLeftCenter = margin + Math.random() * (maxLeft - margin) + btnRect.width / 2;
  const newTop = margin + Math.random() * (maxTop - margin);

  dodgeCount++;
  const waitScale = Math.max(1 - dodgeCount * 0.06, 0.68);
  const yesScale = Math.min(1 + dodgeCount * 0.05, 1.35);

  choiceWaitBtn.style.left = newLeftCenter + "px";
  choiceWaitBtn.style.top = newTop + "px";
  choiceWaitBtn.style.transform = `translate(-50%,0) scale(${waitScale})`;
  choiceYesBtn.style.transform = `translateX(-50%) scale(${yesScale})`;

  const hints = CONFIG.question.dodgeHints;
  if (hints && hints.length) {
    dodgeHint.textContent = hints[Math.min(dodgeCount - 1, hints.length - 1)];
  }
}

// desktop: kabur kalau kursor mendekat
choicesZone.addEventListener("mousemove", (e) => {
  if (current !== "question") return;
  const btnRect = choiceWaitBtn.getBoundingClientRect();
  const cx = btnRect.left + btnRect.width / 2;
  const cy = btnRect.top + btnRect.height / 2;
  const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
  if (dist < DODGE_THRESHOLD) dodgeWaitButton();
});

// mobile: kabur begitu disentuh, jangan langsung ke-trigger sebagai klik
choiceWaitBtn.addEventListener("touchstart", (e) => {
  if (current !== "question") return;
  e.preventDefault();
  dodgeWaitButton();
}, { passive: false });

choiceYesBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  lastChoice = "yes";
  showClosing();
});
choiceWaitBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  lastChoice = "wait";
  showClosing();
});

function showClosing() {
  const body = document.getElementById("closingBody");
  const titleEl = document.getElementById("closingTitle");
  const photoWrap = document.getElementById("closingPhotoWrap");
  const photoImg = document.getElementById("closingPhoto");

  body.innerHTML = "";
  const lines = lastChoice === "yes" ? CONFIG.closing.yes : CONFIG.closing.wait;
  lines.forEach((t) => {
    const p = document.createElement("p");
    p.textContent = t;
    body.appendChild(p);
  });

  if (lastChoice === "yes") {
    titleEl.textContent = CONFIG.closing.yesTitle;
    titleEl.style.display = "";
    photoWrap.classList.remove("hidden");
    photoImg.onerror = () => photoWrap.classList.add("hidden");
    photoImg.src = CONFIG.closing.photo;
  } else {
    titleEl.style.display = "none";
    photoWrap.classList.add("hidden");
  }

  goTo("closing");
  if (lastChoice === "yes") for (let i = 0; i < 6; i++) setTimeout(spawnHeart, i * 90);
}

boot();
