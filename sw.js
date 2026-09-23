const CACHE_PREFIX = "aadesh-blog";
const CACHE_VERSION = "vz87eoz";
const DOCUMENT_CACHE = `${CACHE_PREFIX}-documents-${CACHE_VERSION}`;
const IMAGE_CACHE = `${CACHE_PREFIX}-images-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${CACHE_VERSION}`;
const MAX_IMAGE_CACHE_ENTRIES = 80;
const APP_SHELL_URLS = [

  "/",
  "/index.html",
  "/favicon-32.png",
  "/favicon-16.png",
  "/apple-touch-icon.png",
  "/profile-160.avif",
  "/profile-400.avif",
  "/profile-160.webp",
  "/profile-400.webp",
  "/logo-mark-96.webp",
  // --- hashed build assets (injected by sw-manifest.mjs) ---
  "/assets/About-Cw5dexvr.js",
  "/assets/ArticleCard-C8RS1XdG.js",
  "/assets/BackToTop-cUa8EsZ7.js",
  "/assets/Blog-Wy-lU21h.js",
  "/assets/BlogPost-CHqft2-V.js",
  "/assets/Books-BUynober.js",
  "/assets/Breadcrumbs-WqnhrdJ4.js",
  "/assets/CommandPalette-Lg1tb-YL.js",
  "/assets/DiagramPrimitives-BJ2nbYGz.js",
  "/assets/EvidenceChecklist-ByIC9jdK.js",
  "/assets/Gallery-CAB971mz.js",
  "/assets/List-aaGdN2gM.js",
  "/assets/NotFound-BPw1xiBU.js",
  "/assets/PainterlyField-4N3X01jj.js",
  "/assets/PainterlyField-Il48Eo6D.css",
  "/assets/Projects-BpoX6YXc.js",
  "/assets/Tag-CkaF4rOR.js",
  "/assets/TagPage-DxrFqwCw.js",
  "/assets/article-8ApWl-Yg.css",
  "/assets/articleExperiments-Ct5PdKtT.js",
  "/assets/bleu-lies-CrtOv-tj.js",
  "/assets/books-BqwqEZlj.js",
  "/assets/collectionModel-D6EQYI4a.js",
  "/assets/command-palette-BiNjGXwE.css",
  "/assets/command-palette-CT7727d5.js",
  "/assets/data-guides-PA9irEse.css",
  "/assets/data-guides-kmte0WCY.js",
  "/assets/demos-close-deals-boring-systems-keep-them-NhF_D-3Q.js",
  "/assets/dialog-D90_EGJ1.js",
  "/assets/editorial-experiments-BLjLaGpU.css",
  "/assets/editorial-experiments-BNuEt3w4.js",
  "/assets/evals-are-the-operating-system-CJwmT5fY.js",
  "/assets/four-years-of-saturdays-Ct_y6rhW.js",
  "/assets/fraunces-latin-standard-normal-DihXLNYH.woff2",
  "/assets/golden-cases-come-from-funerals-BrMRKfrs.js",
  "/assets/icons-BAybrT8A.js",
  "/assets/index-BCaC5xar.css",
  "/assets/index-BMLh7khC.js",
  "/assets/index-DPGwyPfZ.js",
  "/assets/inferenceExperiments-BdmvTyA7.css",
  "/assets/inferenceExperiments-DLdhlnke.js",
  "/assets/inferenceModels-njTlEobm.js",
  "/assets/outfit-latin-wght-normal-Bc-8i84L.woff2",
  "/assets/own-your-got-damn-failures-7w6327UZ.js",
  "/assets/principles-i-reread-before-starting-anything-new-BL8x9Qxd.js",
  "/assets/router-BajukSaI.js",
  "/assets/running-two-model-providers-in-production-_OSpP-vU.js",
  "/assets/search-for-languages-the-internet-forgot-CTvD7ZRF.js",
  "/assets/siteSearch-_J8rpFm-.js",
  "/assets/stop-being-the-thing-inside-the-loop-BZB2ulu8.js",
  "/assets/structured-demand-from-chaos-BPbAvi6v.js",
  "/assets/systems-experiments-ChCL3hnQ.js",
  "/assets/systems-experiments-DsGTSeFV.css",
  "/assets/the-bug-was-in-the-transcript-flXZNeFk.js",
  "/assets/the-first-two-weeks-are-for-listening-C3XrS1mF.js",
  "/assets/the-model-is-the-easy-part-CHTdn5A_.js",
  "/assets/the-unreasonable-effectiveness-of-cleaning-data-RFVcBYh0.js",
  "/assets/the-voice-agent-tradeoff-Cr7KKRrq.js",
  "/assets/ui-BaX_zA6d.js",
  "/assets/useSteppedPlayback-Bn5VH_Jr.js",
  "/assets/utils-BTGVH9Kg.js",
  "/assets/vendor-DzA5IH5n.js",
  "/assets/what-actually-happens-when-you-call-an-llm-api-PEhGzDWj.js",
  "/assets/where-the-human-belongs-in-the-loop-i0bO26XV.js",
  "/assets/why-output-tokens-cost-more-DCzpvIGQ.js",
  "/assets/writing-down-what-you-didnt-measure-DT4N5_dd.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(DOCUMENT_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.registration.navigationPreload ? self.registration.navigationPreload.enable() : undefined,
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames
              .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX))
              .filter(
                (cacheName) =>
                  cacheName !== DOCUMENT_CACHE &&
                  cacheName !== IMAGE_CACHE &&
                  cacheName !== RUNTIME_CACHE
              )
              .map((cacheName) => caches.delete(cacheName))
          )
        ),
    ]).then(() => self.clients.claim())
  );
});

const trimCache = async (cacheName, maxEntries) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;

  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
};

const cacheFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok || response.type === "opaque") {
    cache.put(request, response.clone());
  }

  return response;
};

const networkFirst = async (request, cacheName, preloadResponsePromise) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  try {
    const response =
      (await Promise.resolve(preloadResponsePromise)) || (await fetch(request));
    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    return cached || Response.error();
  }
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, DOCUMENT_CACHE, event.preloadResponse));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(
      cacheFirst(request, IMAGE_CACHE).then((response) => {
        event.waitUntil(trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE_ENTRIES));
        return response;
      })
    );
    return;
  }

  const url = new URL(request.url);
  if (url.origin === self.location.origin && url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
  }
});
