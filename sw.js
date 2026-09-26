/* Service worker: fast repeat visits without hoarding the whole site.
 *
 * GitHub Pages sends every file with max-age=600, so this worker is the only
 * long-lived cache. It used to precache every hashed chunk in the build
 * (~1.7MB: every article body, diagram, and data set) on a visitor's first
 * page, and threw all of it away on each deploy because the cache names
 * carried the build hash. Now:
 *
 *  - install precaches only the app shell: the home page, the profile images
 *    and favicons, and the entry script, styles, and fonts every page needs
 *    (scripts/sw-manifest.mjs injects those from dist/index.html). The page
 *    that registered the worker has already fetched these, so they come from
 *    the HTTP cache rather than the network.
 *  - everything else is cached when it is actually used. Hashed /assets/ files
 *    are immutable, so they live in one stable cache that survives deploys;
 *    activate prunes only the files the new build no longer ships.
 *  - images and visited pages live in stable, size-capped caches.
 *  - a newly installed worker is told which assets its first page already
 *    downloaded (see index.html), so those count too.
 */
const CACHE_PREFIX = "aadesh-blog";
// Replaced at build time with a hash of this build's asset list.
const CACHE_VERSION = "vdx4pcm";
const SHELL_CACHE = `${CACHE_PREFIX}-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `${CACHE_PREFIX}-assets`;
const IMAGE_CACHE = `${CACHE_PREFIX}-images`;
const PAGE_CACHE = `${CACHE_PREFIX}-pages`;
const MAX_IMAGE_CACHE_ENTRIES = 80;
const MAX_PAGE_CACHE_ENTRIES = 30;

const APP_SHELL_URLS = [

  "/",
  "/favicon-32.png",
  "/favicon-16.png",
  "/apple-touch-icon.png",
  "/profile-160.avif",
  "/profile-400.avif",
  "/profile-160.webp",
  "/profile-400.webp",
  "/logo-mark-96.webp",
  // --- entry assets every page loads (injected by sw-manifest.mjs) ---
  "/assets/icons-D-GLO1H3.js",
  "/assets/index-DdFzuUPw.js",
  "/assets/index-Ds3m1t5l.css",
  "/assets/router-BajukSaI.js",
  "/assets/ui-BaX_zA6d.js",
  "/assets/utils-BTGVH9Kg.js",
  "/assets/vendor-DzA5IH5n.js",
];

// Every hashed file this build ships (injected by sw-manifest.mjs). Used only
// to prune ASSET_CACHE of files from older builds, never to fetch.
const BUILD_ASSETS = ["/assets/About-BTB3MDGv.js","/assets/ArticleCard-DnrPltJD.js","/assets/BackToTop-C_pl7F_N.js","/assets/Blog-QwEuQZqE.js","/assets/BlogPost-BoA-BioX.js","/assets/Books-BqvI3QEE.js","/assets/Breadcrumbs-DipLvrfk.js","/assets/CommandPalette-BiNjGXwE.css","/assets/CommandPalette-DoYD7dlg.js","/assets/DiagramPrimitives-BrO_wQjC.js","/assets/EvidenceChecklist-Dr0tM1Zj.js","/assets/Gallery-B62LFNYb.js","/assets/List-D8Oe0qSr.js","/assets/NotFound-Diao1UEK.js","/assets/PainterlyField-DzyW57hh.js","/assets/PainterlyField-Il48Eo6D.css","/assets/Projects-CjvEmHgM.js","/assets/Tag-BotTEuJO.js","/assets/TagPage-B9cNVkvG.js","/assets/Toolkit-DZ2dxl3F.css","/assets/Toolkit-TyqxOeRk.js","/assets/article-D3Ab69XK.css","/assets/articleExperiments-Ct5PdKtT.js","/assets/bleu-lies-D3J3OWej.js","/assets/books-BqwqEZlj.js","/assets/collectionModel-D6EQYI4a.js","/assets/data-guides-MJ20CU9X.js","/assets/data-guides-rjR8_lic.css","/assets/demos-close-deals-boring-systems-keep-them-CVl5bqXn.js","/assets/dialog-CW_2AcLE.js","/assets/editorial-experiments-BLjLaGpU.css","/assets/editorial-experiments-BNuEt3w4.js","/assets/evals-are-the-operating-system-Dhbdw-b0.js","/assets/four-years-of-saturdays-Ct_y6rhW.js","/assets/fraunces-latin-standard-normal-DihXLNYH.woff2","/assets/golden-cases-come-from-funerals-fGQaE5Ol.js","/assets/icons-D-GLO1H3.js","/assets/index-DPGwyPfZ.js","/assets/index-DdFzuUPw.js","/assets/index-Ds3m1t5l.css","/assets/inferenceExperiments-BdmvTyA7.css","/assets/inferenceExperiments-DLdhlnke.js","/assets/inferenceModels-njTlEobm.js","/assets/links-CLU51XNf.js","/assets/outfit-latin-wght-normal-Bc-8i84L.woff2","/assets/own-your-got-damn-failures-B9-B0w94.js","/assets/principles-i-reread-before-starting-anything-new-F8VSrFfR.js","/assets/router-BajukSaI.js","/assets/running-two-model-providers-in-production--64-V9rE.js","/assets/search-for-languages-the-internet-forgot-BJaReUon.js","/assets/siteSearch-BpwJdkzd.js","/assets/stop-being-the-thing-inside-the-loop-BWB3juEZ.js","/assets/structured-demand-from-chaos-DYPj4RQe.js","/assets/systems-experiments-DpaYKzGz.js","/assets/systems-experiments-DsGTSeFV.css","/assets/the-bug-was-in-the-transcript-NMg0UIL8.js","/assets/the-first-two-weeks-are-for-listening-Cd60WYvw.js","/assets/the-model-is-the-easy-part-Cy_9Y8AW.js","/assets/the-unreasonable-effectiveness-of-cleaning-data-DqMRq2L4.js","/assets/the-voice-agent-tradeoff-C0BMpMKI.js","/assets/toolkit-DTYFstzT.js","/assets/ui-BaX_zA6d.js","/assets/useRailFollowsHeader-yppIIKOJ.js","/assets/useSteppedPlayback-YjKOOXKj.js","/assets/utils-BTGVH9Kg.js","/assets/vendor-DzA5IH5n.js","/assets/what-actually-happens-when-you-call-an-llm-api-CNc0m3Fn.js","/assets/where-the-human-belongs-in-the-loop-CMgtoF5N.js","/assets/why-output-tokens-cost-more-D0Ar5hm_.js","/assets/writing-down-what-you-didnt-measure-CHlU-Qo-.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

const pruneAssets = async () => {
  if (!BUILD_ASSETS.length) return;
  const current = new Set(BUILD_ASSETS);
  const cache = await caches.open(ASSET_CACHE);
  const keys = await cache.keys();
  await Promise.all(
    keys
      .map((request) => [request, new URL(request.url).pathname])
      .filter(([, pathname]) => pathname.startsWith("/assets/") && !current.has(pathname))
      .map(([request]) => cache.delete(request))
  );
};

const trimCache = async (cacheName, maxEntries) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
};

self.addEventListener("activate", (event) => {
  const keep = new Set([SHELL_CACHE, ASSET_CACHE, IMAGE_CACHE, PAGE_CACHE]);
  event.waitUntil(
    Promise.all([
      self.registration.navigationPreload ? self.registration.navigationPreload.enable() : undefined,
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames
              .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX) && !keep.has(cacheName))
              .map((cacheName) => caches.delete(cacheName))
          )
        ),
      pruneAssets(),
      trimCache(PAGE_CACHE, MAX_PAGE_CACHE_ENTRIES),
      trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE_ENTRIES),
    ]).then(() => self.clients.claim())
  );
});

const isOk = (response) => response && response.ok && response.type === "basic";

// Hashed build files never change, so any cached copy is final.
const cacheFirst = async (request, cacheName) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (isOk(response)) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
};

// Images and unhashed fonts keep their paths across edits: serve the cached
// copy at once and refresh it in the background.
const staleWhileRevalidate = async (event, cacheName, maxEntries) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);
  const refresh = fetch(event.request)
    .then(async (response) => {
      if (isOk(response)) {
        await cache.put(event.request, response.clone());
        if (!cached && maxEntries) await trimCache(cacheName, maxEntries);
      }
      return response;
    })
    .catch(() => cached);
  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }
  return refresh;
};

const networkFirst = async (request, cacheName, preloadResponsePromise) => {
  const cache = await caches.open(cacheName);
  try {
    const response =
      (await Promise.resolve(preloadResponsePromise)) || (await fetch(request));
    if (response.ok) {
      await cache.put(request, response.clone());
      trimCache(cacheName, MAX_PAGE_CACHE_ENTRIES);
    }
    return response;
  } catch {
    return (await cache.match(request)) || (await caches.match(request)) || Response.error();
  }
};

// The first page loads before this worker controls it, so its assets bypass
// the fetch handler. index.html posts their URLs once the worker is ready;
// copying them in reads the HTTP cache, not the network.
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "cache-loaded-assets" || !Array.isArray(data.urls)) return;
  event.waitUntil(
    caches.open(ASSET_CACHE).then(async (cache) => {
      const current = new Set(BUILD_ASSETS);
      await Promise.all(
        data.urls
          .map((href) => new URL(href, self.location.origin))
          .filter((url) => url.origin === self.location.origin && url.pathname.startsWith("/assets/"))
          .filter((url) => !current.size || current.has(url.pathname))
          .map(async (url) => {
            if (await caches.match(url.pathname)) return;
            try {
              const response = await fetch(url.pathname);
              if (isOk(response)) await cache.put(url.pathname, response);
            } catch {
              /* offline: it will be cached on next use */
            }
          })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, PAGE_CACHE, event.preloadResponse));
    return;
  }

  // Cross-origin requests go to the browser's HTTP cache untouched: caching
  // opaque responses costs ~7MB of quota each in Chrome.
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(staleWhileRevalidate(event, IMAGE_CACHE, MAX_IMAGE_CACHE_ENTRIES));
    return;
  }

  if (url.pathname.startsWith("/fonts/")) {
    event.respondWith(staleWhileRevalidate(event, ASSET_CACHE));
  }
});
