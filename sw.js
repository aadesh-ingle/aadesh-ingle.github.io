const CACHE_PREFIX = "aadesh-blog";
const CACHE_VERSION = "v93l2qk";
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
  "/assets/About-BgOhuf__.js",
  "/assets/ArticleCard-DHreUHCv.js",
  "/assets/BackToTop-DAsaPnR8.js",
  "/assets/Blog-Bx4pgNLw.js",
  "/assets/BlogPost-BmgQC6uu.js",
  "/assets/Books-Dn0wvAbC.js",
  "/assets/Breadcrumbs-Cll8a-tk.js",
  "/assets/CommandPalette-ClEfLHkL.js",
  "/assets/DiagramPrimitives-Bq0PzrHY.js",
  "/assets/Gallery-BtEshF2g.js",
  "/assets/List-t2GsqzD4.js",
  "/assets/NotFound-DUp2zzzG.js",
  "/assets/PainterlyField--u5MRom5.js",
  "/assets/Projects-BG7nv5YI.js",
  "/assets/SystemScene-B4MtcT0J.js",
  "/assets/SystemScene-CWIixmzq.css",
  "/assets/Tag-eG2Q0uEh.js",
  "/assets/TagPage-AZ0KPjx3.js",
  "/assets/article-C-3kZe4X.css",
  "/assets/bleu-lies-ARs15d8J.js",
  "/assets/books-DE2pbuI7.js",
  "/assets/command-palette-BiNjGXwE.css",
  "/assets/command-palette-DDtA41n5.js",
  "/assets/data-guides-CMA1X8nn.js",
  "/assets/data-guides-Oj24b8mM.css",
  "/assets/demos-close-deals-boring-systems-keep-them-Czq02ijE.js",
  "/assets/dialog-Gt8Jdms9.js",
  "/assets/editorial-figures-ZL4Zy6OA.css",
  "/assets/evals-are-the-operating-system-DYQb04yr.js",
  "/assets/four-years-of-saturdays-Ct_y6rhW.js",
  "/assets/fraunces-latin-standard-normal-DihXLNYH.woff2",
  "/assets/golden-cases-come-from-funerals-DIIFInmC.js",
  "/assets/icons-koTo5Nau.js",
  "/assets/index-CEfUCARi.css",
  "/assets/index-CcXEALJ1.js",
  "/assets/index-DPGwyPfZ.js",
  "/assets/inferenceModels-Bx44whbS.js",
  "/assets/outfit-latin-wght-normal-Bc-8i84L.woff2",
  "/assets/own-your-got-damn-failures-B214bew2.js",
  "/assets/principles-i-reread-before-starting-anything-new-Bdpn0LtT.js",
  "/assets/router-BajukSaI.js",
  "/assets/running-two-model-providers-in-production-rQRMEzAo.js",
  "/assets/search-for-languages-the-internet-forgot-s_5Ej2cp.js",
  "/assets/stop-being-the-thing-inside-the-loop-BUYrZwMK.js",
  "/assets/structured-demand-from-chaos-HXAjE1Qn.js",
  "/assets/the-bug-was-in-the-transcript-BxMDCwVx.js",
  "/assets/the-first-two-weeks-are-for-listening-GOhjmoKo.js",
  "/assets/the-model-is-the-easy-part-CemGcIPi.js",
  "/assets/the-unreasonable-effectiveness-of-cleaning-data-CKMNG7gh.js",
  "/assets/the-voice-agent-tradeoff-CznFjH5p.js",
  "/assets/ui-BaX_zA6d.js",
  "/assets/useSteppedPlayback-DO1d3aQ9.js",
  "/assets/utils-BTGVH9Kg.js",
  "/assets/vendor-DzA5IH5n.js",
  "/assets/what-actually-happens-when-you-call-an-llm-api-2Wlxmksk.js",
  "/assets/where-the-human-belongs-in-the-loop-DD2gWqtL.js",
  "/assets/why-output-tokens-cost-more-BPwN7wbi.js",
  "/assets/writing-down-what-you-didnt-measure-Bv_G-fvD.js",
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
