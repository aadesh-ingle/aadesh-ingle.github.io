const CACHE_PREFIX = "aadesh-blog";
const CACHE_VERSION = "vy3b9v";
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
  "/assets/About-C8U-SaR_.js",
  "/assets/ArticleCard-BMdu3GZK.js",
  "/assets/BackToTop-BH68cD29.js",
  "/assets/Blog-CxgsyXPm.js",
  "/assets/BlogPost-IzpFMX-y.js",
  "/assets/Books-Cxbt6Cya.js",
  "/assets/Breadcrumbs-CUPkEG8K.js",
  "/assets/CommandPalette-BRn_M8jX.js",
  "/assets/CommandPalette-BiNjGXwE.css",
  "/assets/DiagramPrimitives-BJ2nbYGz.js",
  "/assets/EvidenceChecklist-ByIC9jdK.js",
  "/assets/Gallery-JJI0fhOj.js",
  "/assets/List-DcmPkCNH.js",
  "/assets/NotFound-Pfeb1SOF.js",
  "/assets/PainterlyField-4N3X01jj.js",
  "/assets/PainterlyField-Il48Eo6D.css",
  "/assets/Projects-Dgp6mqnx.js",
  "/assets/Tag-NKxBI_q3.js",
  "/assets/TagPage-DPPoZGvj.js",
  "/assets/Toolkit-BwVTyv8Y.js",
  "/assets/Toolkit-DVmrfic7.css",
  "/assets/article-8ApWl-Yg.css",
  "/assets/articleExperiments-Ct5PdKtT.js",
  "/assets/bleu-lies-BY6cwg1k.js",
  "/assets/books-BqwqEZlj.js",
  "/assets/collectionModel-D6EQYI4a.js",
  "/assets/data-guides-PA9irEse.css",
  "/assets/data-guides-kmte0WCY.js",
  "/assets/demos-close-deals-boring-systems-keep-them-BQ-J9QSY.js",
  "/assets/dialog-CsFGmbiZ.js",
  "/assets/editorial-experiments-BLjLaGpU.css",
  "/assets/editorial-experiments-BNuEt3w4.js",
  "/assets/evals-are-the-operating-system-BR2vcMU3.js",
  "/assets/four-years-of-saturdays-Ct_y6rhW.js",
  "/assets/fraunces-latin-standard-normal-DihXLNYH.woff2",
  "/assets/golden-cases-come-from-funerals-4e-2EQSQ.js",
  "/assets/icons-kIM2910b.js",
  "/assets/index-C58G7uH5.css",
  "/assets/index-CoyzkGLN.js",
  "/assets/index-DPGwyPfZ.js",
  "/assets/inferenceExperiments-BdmvTyA7.css",
  "/assets/inferenceExperiments-DLdhlnke.js",
  "/assets/inferenceModels-njTlEobm.js",
  "/assets/links-CLU51XNf.js",
  "/assets/outfit-latin-wght-normal-Bc-8i84L.woff2",
  "/assets/own-your-got-damn-failures-JiJA53fN.js",
  "/assets/principles-i-reread-before-starting-anything-new-Dw7KUwCQ.js",
  "/assets/router-BajukSaI.js",
  "/assets/running-two-model-providers-in-production-CADfI39b.js",
  "/assets/search-for-languages-the-internet-forgot-CIi-oFpD.js",
  "/assets/siteSearch-BpwJdkzd.js",
  "/assets/stop-being-the-thing-inside-the-loop-XQNnorDo.js",
  "/assets/structured-demand-from-chaos-C-Aa4XSt.js",
  "/assets/systems-experiments-ChCL3hnQ.js",
  "/assets/systems-experiments-DsGTSeFV.css",
  "/assets/the-bug-was-in-the-transcript-Cn1uhGuH.js",
  "/assets/the-first-two-weeks-are-for-listening-HK5vQeC8.js",
  "/assets/the-model-is-the-easy-part-BvnzHA9L.js",
  "/assets/the-unreasonable-effectiveness-of-cleaning-data-C8b83wz9.js",
  "/assets/the-voice-agent-tradeoff-Cdr3M1dZ.js",
  "/assets/toolkit-DTYFstzT.js",
  "/assets/ui-BaX_zA6d.js",
  "/assets/useSteppedPlayback-Bn5VH_Jr.js",
  "/assets/utils-BTGVH9Kg.js",
  "/assets/vendor-DzA5IH5n.js",
  "/assets/what-actually-happens-when-you-call-an-llm-api-Ns3EVlpI.js",
  "/assets/where-the-human-belongs-in-the-loop-BY102NGj.js",
  "/assets/why-output-tokens-cost-more-WslX55iz.js",
  "/assets/writing-down-what-you-didnt-measure-Di78gpvS.js",
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
