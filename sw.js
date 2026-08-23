const CACHE_PREFIX = "aadesh-blog";
const CACHE_VERSION = "vmj72xt";
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
  "/assets/About-BReRiOJK.js",
  "/assets/ArticleCard-CLwo6UnR.js",
  "/assets/Artifacts-Bd8Ap46b.js",
  "/assets/BackToTop-DAsaPnR8.js",
  "/assets/Blog-Dhu0_6fk.js",
  "/assets/BlogPost-v-lFDyim.js",
  "/assets/Books-DY69X0JE.js",
  "/assets/Breadcrumbs-Cv_6ExUQ.js",
  "/assets/CommandPalette-BbZeBqEs.js",
  "/assets/Gallery-DTcKbueS.js",
  "/assets/List-iUYG5rI0.js",
  "/assets/NotFound-67S3vUgo.js",
  "/assets/Projects-mu05-Y-k.js",
  "/assets/Tag-C8J0aZds.js",
  "/assets/TagPage-JkviuLQs.js",
  "/assets/article-BTZkej7Q.css",
  "/assets/bleu-lies-D19lktFi.js",
  "/assets/books-DE2pbuI7.js",
  "/assets/command-palette-BiNjGXwE.css",
  "/assets/command-palette-DDtA41n5.js",
  "/assets/demos-close-deals-boring-systems-keep-them-BT0x5n4S.js",
  "/assets/dialog-DeRN0gnN.js",
  "/assets/evals-are-the-operating-system-Bu0xitW9.js",
  "/assets/four-years-of-saturdays-Ct_y6rhW.js",
  "/assets/fraunces-latin-standard-normal-DihXLNYH.woff2",
  "/assets/golden-cases-come-from-funerals-Gb9FVNsO.js",
  "/assets/icons-koTo5Nau.js",
  "/assets/index-BklIE_KD.js",
  "/assets/index-DPGwyPfZ.js",
  "/assets/index-nbqxki7Z.css",
  "/assets/outfit-latin-wght-normal-Bc-8i84L.woff2",
  "/assets/own-your-got-damn-failures-B7gklaFu.js",
  "/assets/principles-i-reread-before-starting-anything-new-CzDp_iwm.js",
  "/assets/router-BajukSaI.js",
  "/assets/running-two-model-providers-in-production-1ACjfeB-.js",
  "/assets/search-for-languages-the-internet-forgot-z5_noF_y.js",
  "/assets/stop-being-the-thing-inside-the-loop-Bd1xllo4.js",
  "/assets/structured-demand-from-chaos-C6n8n_z6.js",
  "/assets/the-bug-was-in-the-transcript-aZU0DCoJ.js",
  "/assets/the-first-two-weeks-are-for-listening--Wpcd6dB.js",
  "/assets/the-model-is-the-easy-part-Cjq9Zngc.js",
  "/assets/the-unreasonable-effectiveness-of-cleaning-data-CTcmvV18.js",
  "/assets/the-voice-agent-tradeoff-BvrpCZCK.js",
  "/assets/ui-BaX_zA6d.js",
  "/assets/utils-BTGVH9Kg.js",
  "/assets/vendor-DzA5IH5n.js",
  "/assets/what-actually-happens-when-you-call-an-llm-api-B-654zoE.js",
  "/assets/where-the-human-belongs-in-the-loop-DdNF0AJi.js",
  "/assets/why-output-tokens-cost-more-8SNqYyRI.js",
  "/assets/writing-down-what-you-didnt-measure-CFxVMW21.js",
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
