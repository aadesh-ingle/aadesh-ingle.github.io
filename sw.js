const CACHE_PREFIX = "aadesh-blog";
const CACHE_VERSION = "vie3a6o";
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
  "/assets/About-Ceg7Oov9.js",
  "/assets/ArticleCard-C5wWkQ5j.js",
  "/assets/BackToTop-DAsaPnR8.js",
  "/assets/Blog-Dbk4G8X7.js",
  "/assets/BlogPost-BnSSD_F6.js",
  "/assets/Books-DLdcNFOd.js",
  "/assets/Breadcrumbs-CAq1DQxg.js",
  "/assets/CommandPalette-yjpn-Mt6.js",
  "/assets/DiagramPrimitives-BJ2nbYGz.js",
  "/assets/EvidenceChecklist-ByIC9jdK.js",
  "/assets/Gallery-BrYFtJeZ.js",
  "/assets/List-CmP90WB7.js",
  "/assets/NotFound-CGqQuJ7d.js",
  "/assets/PainterlyField-4N3X01jj.js",
  "/assets/PainterlyField-Il48Eo6D.css",
  "/assets/Projects-BdLijtrt.js",
  "/assets/Tag-BSyAZtwx.js",
  "/assets/TagPage-D8EYHDU-.js",
  "/assets/article-8ApWl-Yg.css",
  "/assets/articleExperiments-Ct5PdKtT.js",
  "/assets/bleu-lies-CrtOv-tj.js",
  "/assets/books-DE2pbuI7.js",
  "/assets/command-palette-BiNjGXwE.css",
  "/assets/command-palette-DDtA41n5.js",
  "/assets/data-guides-PA9irEse.css",
  "/assets/data-guides-kmte0WCY.js",
  "/assets/demos-close-deals-boring-systems-keep-them-NhF_D-3Q.js",
  "/assets/dialog-o23nL_Rr.js",
  "/assets/editorial-experiments-BLjLaGpU.css",
  "/assets/editorial-experiments-BNuEt3w4.js",
  "/assets/evals-are-the-operating-system-CJwmT5fY.js",
  "/assets/four-years-of-saturdays-Ct_y6rhW.js",
  "/assets/fraunces-latin-standard-normal-DihXLNYH.woff2",
  "/assets/golden-cases-come-from-funerals-BrMRKfrs.js",
  "/assets/icons-koTo5Nau.js",
  "/assets/index-BNzjWbFZ.js",
  "/assets/index-BxcgUjUp.css",
  "/assets/index-DPGwyPfZ.js",
  "/assets/inferenceExperiments-BdmvTyA7.css",
  "/assets/inferenceExperiments-DLdhlnke.js",
  "/assets/inferenceModels-D6lBEfZn.js",
  "/assets/outfit-latin-wght-normal-Bc-8i84L.woff2",
  "/assets/own-your-got-damn-failures-7w6327UZ.js",
  "/assets/principles-i-reread-before-starting-anything-new-BL8x9Qxd.js",
  "/assets/router-BajukSaI.js",
  "/assets/running-two-model-providers-in-production-BI-k_c6k.js",
  "/assets/search-for-languages-the-internet-forgot-CTvD7ZRF.js",
  "/assets/stop-being-the-thing-inside-the-loop-BZB2ulu8.js",
  "/assets/structured-demand-from-chaos-ECfu6JGF.js",
  "/assets/systems-experiments-ChCL3hnQ.js",
  "/assets/systems-experiments-DsGTSeFV.css",
  "/assets/the-bug-was-in-the-transcript-CWPkR0dI.js",
  "/assets/the-first-two-weeks-are-for-listening-C3XrS1mF.js",
  "/assets/the-model-is-the-easy-part-CHTdn5A_.js",
  "/assets/the-unreasonable-effectiveness-of-cleaning-data-fnjv7g2m.js",
  "/assets/the-voice-agent-tradeoff-BaI8XQJC.js",
  "/assets/ui-BaX_zA6d.js",
  "/assets/useSteppedPlayback-Bn5VH_Jr.js",
  "/assets/utils-BTGVH9Kg.js",
  "/assets/vendor-DzA5IH5n.js",
  "/assets/what-actually-happens-when-you-call-an-llm-api-07_vfDli.js",
  "/assets/where-the-human-belongs-in-the-loop-i0bO26XV.js",
  "/assets/why-output-tokens-cost-more-BUCYNYoL.js",
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
