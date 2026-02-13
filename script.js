import { PageFlip } from "https://unpkg.com/page-flip@2.0.7/dist/js/page-flip.module.js";

// ====== CONFIG ======
const TOTAL_PAGES = 120;
const IMG_DIR = "images";
const ASPECT = 1545 / 2000; // height / width

const STAGE_PADDING = 18;
const HUD_SPACE = 70;
const NAV_GAP = 28;
const NAV_EXTRA = 12;

const bookEl  = document.getElementById("book");
const hudEl   = document.getElementById("hud");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const wrapEl  = document.getElementById("wrap");

wrapEl.style.setProperty("--nav-gap", NAV_GAP + "px");

const images = Array.from({ length: TOTAL_PAGES }, (_, i) => `${IMG_DIR}/${i + 1}.png`);

let pageFlip = null;
let currentIndex = 0;

function updateHud() {
  const i = pageFlip?.getCurrentPageIndex?.() ?? 0;
  hudEl.textContent = `Page ${i + 1} / ${TOTAL_PAGES} (← →, click or drag)`;
}

function buttonSizePx() {
  const vw = window.innerWidth;
  return Math.max(54, Math.min(0.055 * vw, 92));
}

function computePageSize() {
  const btn = buttonSizePx();
  const sideReserve = (btn + NAV_GAP + NAV_EXTRA) * 2;

  const vw = window.innerWidth  - (STAGE_PADDING * 2) - sideReserve;
  const vh = window.innerHeight - (STAGE_PADDING * 2) - HUD_SPACE;

  const pageW = Math.floor(Math.min(vw / 2, vh / ASPECT));
  const pageH = Math.floor(pageW * ASPECT);

  return {
    pageW: Math.max(360, pageW),
    pageH: Math.max(240, pageH),
  };
}

async function buildFlipbook() {
  const { pageW, pageH } = computePageSize();

  bookEl.innerHTML = "";

  pageFlip = new PageFlip(bookEl, {
    width: pageW,
    height: pageH,
    size: "fixed",
    showCover: true,
    usePortrait: false,
    flippingTime: 650,
    drawShadow: true,
    maxShadowOpacity: 0.25,
    swipeDistance: 30,
    mobileScrollSupport: false,
  });

  await pageFlip.loadFromImages(images);

  currentIndex = Math.max(0, Math.min(currentIndex, TOTAL_PAGES - 1));
  pageFlip.flip(currentIndex);

  pageFlip.on("flip", () => {
    currentIndex = pageFlip.getCurrentPageIndex();
    updateHud();
  });

  updateHud();
}

// Controls
prevBtn.addEventListener("click", () => pageFlip?.flipPrev());
nextBtn.addEventListener("click", () => pageFlip?.flipNext());

window.addEventListener("keydown", (e) => {
  if (!pageFlip) return;

  if (e.key === "ArrowLeft")  { e.preventDefault(); pageFlip.flipPrev(); }
  if (e.key === "ArrowRight") { e.preventDefault(); pageFlip.flipNext(); }
  if (e.key === "Home") { e.preventDefault(); pageFlip.flip(0); }
  if (e.key === "End")  { e.preventDefault(); pageFlip.flip(TOTAL_PAGES - 1); }
}, { passive: false });

let t = null;
window.addEventListener("resize", () => {
  clearTimeout(t);
  t = setTimeout(buildFlipbook, 150);
});

// Start
await buildFlipbook();
