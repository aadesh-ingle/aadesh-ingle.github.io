const CACHE_PREFIX = "aadesh-blog";
const CACHE_VERSION = "v9r41kl";
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
  "/assets/About-3WyCv6oV.js",
  "/assets/ArticleCard-HB7Ctd9m.js",
  "/assets/BackToTop-DAsaPnR8.js",
  "/assets/Blog-CVjBl6B1.js",
  "/assets/BlogPost-Cg-t1X6H.js",
  "/assets/Books-C5mTMjpv.js",
  "/assets/Breadcrumbs-DUgfeOPJ.js",
  "/assets/CommandPalette-BHXUHDBf.js",
  "/assets/DiagramPrimitives-1Ynfftim.js",
  "/assets/Gallery-BOXPxWtn.js",
  "/assets/List-pkpcefvk.js",
  "/assets/NotFound-B0qmrCm_.js",
  "/assets/PainterlyField-Duqr27M0.js",
  "/assets/Projects-D5_EZRSG.js",
  "/assets/SystemScene-C2LVY8LH.js",
  "/assets/SystemScene-CWIixmzq.css",
  "/assets/Tag-CKSo7of3.js",
  "/assets/TagPage-CWJKmIyo.js",
  "/assets/article-lQvzQ08c.css",
  "/assets/bleu-lies-K9QzGM6K.js",
  "/assets/books-DE2pbuI7.js",
  "/assets/command-palette-BiNjGXwE.css",
  "/assets/command-palette-DDtA41n5.js",
  "/assets/data-guides-CMA1X8nn.js",
  "/assets/data-guides-Oj24b8mM.css",
  "/assets/demos-close-deals-boring-systems-keep-them-ByuVnat2.js",
  "/assets/dialog-DL5Re1tf.js",
  "/assets/editorial-figures-ZL4Zy6OA.css",
  "/assets/evals-are-the-operating-system-Bkjxj3CY.js",
  "/assets/four-years-of-saturdays-Ct_y6rhW.js",
  "/assets/fraunces-latin-standard-normal-DihXLNYH.woff2",
  "/assets/golden-cases-come-from-funerals-DzxuJCLC.js",
  "/assets/icons-koTo5Nau.js",
  "/assets/index-CEfUCARi.css",
  "/assets/index-CqCuKMNP.js",
  "/assets/index-DPGwyPfZ.js",
  "/assets/inferenceModels-Bx44whbS.js",
  "/assets/outfit-latin-wght-normal-Bc-8i84L.woff2",
  "/assets/own-your-got-damn-failures-kWgRGzhy.js",
  "/assets/principles-i-reread-before-starting-anything-new-B6cuUxoe.js",
  "/assets/router-BajukSaI.js",
  "/assets/running-two-model-providers-in-production-BlNCtLx5.js",
  "/assets/search-for-languages-the-internet-forgot-COFL-b8F.js",
  "/assets/stop-being-the-thing-inside-the-loop-C8TiT22d.js",
  "/assets/structured-demand-from-chaos-C0wk85dY.js",
  "/assets/the-bug-was-in-the-transcript-D8YBAJiC.js",
  "/assets/the-first-two-weeks-are-for-listening-D8jEjFD8.js",
  "/assets/the-model-is-the-easy-part-hfIgViWj.js",
  "/assets/the-unreasonable-effectiveness-of-cleaning-data-D8jFujFX.js",
  "/assets/the-voice-agent-tradeoff-5_BleDFj.js",
  "/assets/ui-BaX_zA6d.js",
  "/assets/useSteppedPlayback-BvoTSPeA.js",
  "/assets/utils-BTGVH9Kg.js",
  "/assets/vendor-DzA5IH5n.js",
  "/assets/what-actually-happens-when-you-call-an-llm-api-CE4gIUj-.js",
  "/assets/where-the-human-belongs-in-the-loop-BEnxJC6x.js",
  "/assets/why-output-tokens-cost-more-Bij08fCc.js",
  "/assets/writing-down-what-you-didnt-measure-B0Zq2qCc.js",
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
