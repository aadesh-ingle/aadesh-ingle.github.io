const CACHE_PREFIX = "aadesh-blog";
const CACHE_VERSION = "vb3rf6s";
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
  "/assets/About-D89E_gvf.js",
  "/assets/ArticleCard-kB3fnpZi.js",
  "/assets/Artifacts-Bd8Ap46b.js",
  "/assets/BackToTop-pWGD2439.js",
  "/assets/Blog-BedgjVVQ.js",
  "/assets/BlogPost-D-T53CHG.js",
  "/assets/Books-4zKmgpr8.js",
  "/assets/Breadcrumbs-Bj9GTuJ-.js",
  "/assets/CommandPalette-BcyWmx4d.js",
  "/assets/Gallery-PWo_18Ok.js",
  "/assets/List-C5bExUZo.js",
  "/assets/NotFound-DO-WE-a8.js",
  "/assets/Projects-CkGHj83t.js",
  "/assets/Tag-CjIqPX3K.js",
  "/assets/TagPage-D1d_3uju.js",
  "/assets/article-DDxFVgWO.css",
  "/assets/bleu-lies-Dw3LYhKY.js",
  "/assets/books-DE2pbuI7.js",
  "/assets/caveat-latin-wght-normal-C1hSzPvX.woff2",
  "/assets/command-palette-DJGsWNIp.css",
  "/assets/command-palette-T1yaO2YF.js",
  "/assets/demos-close-deals-boring-systems-keep-them-D43Pg3Mm.js",
  "/assets/dialog-Cz6fDjTc.js",
  "/assets/evals-are-the-operating-system-CAPpaWSn.js",
  "/assets/four-years-of-saturdays-Ct_y6rhW.js",
  "/assets/fraunces-latin-standard-normal-DihXLNYH.woff2",
  "/assets/golden-cases-come-from-funerals-IovdAvpj.js",
  "/assets/icons-ClU9Uc25.js",
  "/assets/index-D2w4_bIm.js",
  "/assets/index-DDOmrc71.css",
  "/assets/index-DPGwyPfZ.js",
  "/assets/outfit-latin-wght-normal-Bc-8i84L.woff2",
  "/assets/own-your-got-damn-failures-Dcb57EZ4.js",
  "/assets/principles-i-reread-before-starting-anything-new-CzDp_iwm.js",
  "/assets/router-BajukSaI.js",
  "/assets/running-two-model-providers-in-production-Dm7n2eC4.js",
  "/assets/search-for-languages-the-internet-forgot-CbH8LENt.js",
  "/assets/stop-being-the-thing-inside-the-loop-2Ac7lV3B.js",
  "/assets/structured-demand-from-chaos-CAzNlJ-k.js",
  "/assets/the-bug-was-in-the-transcript-DGaaW7bn.js",
  "/assets/the-first-two-weeks-are-for-listening-Ctb842Kz.js",
  "/assets/the-model-is-the-easy-part-DE_zvsBd.js",
  "/assets/the-unreasonable-effectiveness-of-cleaning-data-DBGRH49S.js",
  "/assets/the-voice-agent-tradeoff-1WBU0dK3.js",
  "/assets/ui-BaX_zA6d.js",
  "/assets/utils-BTGVH9Kg.js",
  "/assets/vendor-DzA5IH5n.js",
  "/assets/what-actually-happens-when-you-call-an-llm-api-ClXhi-_t.js",
  "/assets/where-the-human-belongs-in-the-loop-R_hz2fk7.js",
  "/assets/why-output-tokens-cost-more-DYBrILjQ.js",
  "/assets/writing-down-what-you-didnt-measure-D5YyqizF.js",
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
