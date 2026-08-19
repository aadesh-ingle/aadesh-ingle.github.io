const CACHE_PREFIX = "aadesh-blog";
const CACHE_VERSION = "vck9l77";
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
  "/assets/About-Cwl0fhK8.js",
  "/assets/ArticleCard-DILhYjoa.js",
  "/assets/Artifacts-DmKBZMLo.js",
  "/assets/BackToTop-BdrQtkC3.js",
  "/assets/Blog-DrRZzO1W.js",
  "/assets/BlogPost-DKe4hYd4.js",
  "/assets/Books-Duw1vj84.js",
  "/assets/Breadcrumbs-DEaX9CSY.js",
  "/assets/CommandPalette-CHg617hr.js",
  "/assets/Gallery-mn9cY3Sq.js",
  "/assets/List-BSvlzDox.js",
  "/assets/NotFound-DdpYIgG6.js",
  "/assets/Projects-Dxk_5njd.js",
  "/assets/Tag-C__wUbUF.js",
  "/assets/TagPage-BMq10gSM.js",
  "/assets/article-D6W0B2-B.css",
  "/assets/bleu-lies-CXXGiMvO.js",
  "/assets/books-DE2pbuI7.js",
  "/assets/caveat-latin-wght-normal-C1hSzPvX.woff2",
  "/assets/command-palette-B7OqEjc1.css",
  "/assets/command-palette-D4npCbF8.js",
  "/assets/demos-close-deals-boring-systems-keep-them-BfbI5DOr.js",
  "/assets/dialog-BmJ7cq9K.js",
  "/assets/evals-are-the-operating-system-DooQf3O2.js",
  "/assets/four-years-of-saturdays-Ct_y6rhW.js",
  "/assets/fraunces-latin-standard-normal-DihXLNYH.woff2",
  "/assets/golden-cases-come-from-funerals-CjZDki3n.js",
  "/assets/icons-ClU9Uc25.js",
  "/assets/index-4n1udyzm.js",
  "/assets/index-DPGwyPfZ.js",
  "/assets/index-DQmjuQb0.css",
  "/assets/outfit-latin-wght-normal-Bc-8i84L.woff2",
  "/assets/own-your-got-damn-failures-xwRuosdA.js",
  "/assets/principles-i-reread-before-starting-anything-new-CvHeGMEl.js",
  "/assets/router-BVZpA9xC.js",
  "/assets/running-two-model-providers-in-production-2nu-CvVs.js",
  "/assets/search-for-languages-the-internet-forgot-OmMCW2ke.js",
  "/assets/stop-being-the-thing-inside-the-loop-CZs5E3xL.js",
  "/assets/structured-demand-from-chaos-DkrQlLoW.js",
  "/assets/the-bug-was-in-the-transcript-av9z4TQn.js",
  "/assets/the-first-two-weeks-are-for-listening-DdSH9yL9.js",
  "/assets/the-model-is-the-easy-part-BOPv5KDv.js",
  "/assets/the-unreasonable-effectiveness-of-cleaning-data-Bszf_bZ_.js",
  "/assets/the-voice-agent-tradeoff-X87ZP4_J.js",
  "/assets/ui-BaX_zA6d.js",
  "/assets/utils-BTGVH9Kg.js",
  "/assets/vendor-DzA5IH5n.js",
  "/assets/what-actually-happens-when-you-call-an-llm-api-SCF9fsCG.js",
  "/assets/where-the-human-belongs-in-the-loop-Bg8NH4yK.js",
  "/assets/why-output-tokens-cost-more-Cgt4t9hN.js",
  "/assets/writing-down-what-you-didnt-measure-BtaGMYNd.js",
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
