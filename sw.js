const CACHE_PREFIX = "aadesh-blog";
const CACHE_VERSION = "vfjuovx";
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
  "/assets/About-MR5wkhwZ.js",
  "/assets/ArticleCard-D271CEbz.js",
  "/assets/BackToTop-C_pl7F_N.js",
  "/assets/Blog-CDijJTXt.js",
  "/assets/BlogPost-CzY5n1Iu.js",
  "/assets/Books-Qv7uef2h.js",
  "/assets/Breadcrumbs-2VMycpvO.js",
  "/assets/CommandPalette-BiNjGXwE.css",
  "/assets/CommandPalette-k7-pzS0o.js",
  "/assets/DiagramPrimitives-Dt8QnQI2.js",
  "/assets/EvidenceChecklist-Fem0iMw8.js",
  "/assets/Gallery-BsRGK6Vl.js",
  "/assets/List-Bypk0c_z.js",
  "/assets/NotFound-7cFQtj7a.js",
  "/assets/PainterlyField-4N3X01jj.js",
  "/assets/PainterlyField-Il48Eo6D.css",
  "/assets/Projects-CIMS6MGh.js",
  "/assets/Tag-CUOB0No2.js",
  "/assets/TagPage-xobzUDdT.js",
  "/assets/Toolkit-D846BwMx.js",
  "/assets/Toolkit-DZ2dxl3F.css",
  "/assets/article-D3Ab69XK.css",
  "/assets/articleExperiments-Ct5PdKtT.js",
  "/assets/bleu-lies-_1fqv3Gm.js",
  "/assets/books-BqwqEZlj.js",
  "/assets/collectionModel-D6EQYI4a.js",
  "/assets/data-guides-MJ20CU9X.js",
  "/assets/data-guides-rjR8_lic.css",
  "/assets/demos-close-deals-boring-systems-keep-them-ZrevQuCB.js",
  "/assets/dialog-BHPSg6Bq.js",
  "/assets/editorial-experiments-BLjLaGpU.css",
  "/assets/editorial-experiments-BNuEt3w4.js",
  "/assets/evals-are-the-operating-system-C_fMyXUE.js",
  "/assets/four-years-of-saturdays-Ct_y6rhW.js",
  "/assets/fraunces-latin-standard-normal-DihXLNYH.woff2",
  "/assets/golden-cases-come-from-funerals-C3I5rm5C.js",
  "/assets/icons-D-GLO1H3.js",
  "/assets/index-BCNDbPO6.js",
  "/assets/index-CaE_mNXO.css",
  "/assets/index-DPGwyPfZ.js",
  "/assets/inferenceExperiments-BdmvTyA7.css",
  "/assets/inferenceExperiments-DLdhlnke.js",
  "/assets/inferenceModels-njTlEobm.js",
  "/assets/links-CLU51XNf.js",
  "/assets/outfit-latin-wght-normal-Bc-8i84L.woff2",
  "/assets/own-your-got-damn-failures-JiJA53fN.js",
  "/assets/principles-i-reread-before-starting-anything-new-Dw7KUwCQ.js",
  "/assets/router-BajukSaI.js",
  "/assets/running-two-model-providers-in-production-BV3L3VNt.js",
  "/assets/search-for-languages-the-internet-forgot-CvCp4YSW.js",
  "/assets/siteSearch-BpwJdkzd.js",
  "/assets/stop-being-the-thing-inside-the-loop-BV1u3_TB.js",
  "/assets/structured-demand-from-chaos-nvdAOQXd.js",
  "/assets/systems-experiments-DhgSk62z.js",
  "/assets/systems-experiments-DsGTSeFV.css",
  "/assets/the-bug-was-in-the-transcript-a---5lT7.js",
  "/assets/the-first-two-weeks-are-for-listening-DLpV-lyA.js",
  "/assets/the-model-is-the-easy-part-Ct15uWOv.js",
  "/assets/the-unreasonable-effectiveness-of-cleaning-data-BMaNRNd7.js",
  "/assets/the-voice-agent-tradeoff-BAYwBQuo.js",
  "/assets/toolkit-DTYFstzT.js",
  "/assets/ui-BaX_zA6d.js",
  "/assets/useSteppedPlayback-CPu68kb0.js",
  "/assets/useStuckRail-DwOWa-ce.js",
  "/assets/utils-BTGVH9Kg.js",
  "/assets/vendor-DzA5IH5n.js",
  "/assets/what-actually-happens-when-you-call-an-llm-api-ZG6mYsbM.js",
  "/assets/where-the-human-belongs-in-the-loop-BGkcO660.js",
  "/assets/why-output-tokens-cost-more-CACJpM8r.js",
  "/assets/writing-down-what-you-didnt-measure-sEd6gZNB.js",
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
