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
 *  - a navigation that fails with nothing cached gets /offline.html, a
 *    self-contained page (scripts/offline-page.mjs) instead of the browser's
 *    error screen. It lists the pages this device can still open.
 */
const CACHE_PREFIX = "aadesh-blog";
// Replaced at build time with a hash of this build's asset list.
const CACHE_VERSION = "v2ezxj9";
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
  "/offline.html",
  // --- entry assets every page loads (injected by sw-manifest.mjs) ---
  "/assets/icons-D-GLO1H3.js",
  "/assets/index-CxIjEbP7.js",
  "/assets/index-hJkr6zPr.css",
  "/assets/router-BajukSaI.js",
  "/assets/ui-BaX_zA6d.js",
  "/assets/utils-BTGVH9Kg.js",
  "/assets/vendor-DzA5IH5n.js",
];

// Every hashed file this build ships (injected by sw-manifest.mjs). Used only
// to prune ASSET_CACHE of files from older builds, never to fetch.
const BUILD_ASSETS = ["/assets/About-B0KBEtDJ.js","/assets/ArticleCard-3xkWiYNW.js","/assets/ArticleFigure-CPZkr-zx.js","/assets/BackToTop-C_pl7F_N.js","/assets/Blog-gDQbssl1.js","/assets/BlogPost-CDop8Oqn.js","/assets/Books-DpHNyN-F.js","/assets/Breadcrumbs-BYkv9ouh.js","/assets/CommandPalette-k2q6n2xy.css","/assets/CommandPalette-nVW6rLFI.js","/assets/Gallery-ByBJjVcK.js","/assets/List-DesBZqiT.js","/assets/NotFound-SNWlT9BD.js","/assets/Projects-Dsw103P1.js","/assets/Tag-CatB1ndu.js","/assets/TagPage-BujR6c-W.js","/assets/Toolkit-DZ2dxl3F.css","/assets/Toolkit-DoZ-gwhC.js","/assets/article-BC5Ut6IV.css","/assets/articleFigures-CFnTac2V.js","/assets/basket-8Y8znLeG.js","/assets/bleu-lies-CgiWgl8Z.js","/assets/books-BqwqEZlj.js","/assets/branches-CmqYzhls.js","/assets/cabinet-CV6db9_6.js","/assets/calipers-7QEWusML.js","/assets/cards-DMZ2bmN1.js","/assets/collectionModel-D6EQYI4a.js","/assets/demos-close-deals-boring-systems-keep-them-Dt-vew4r.js","/assets/dialog-Dps1A03W.js","/assets/dish-C6bC0qle.js","/assets/drawer-BMMGwLHm.js","/assets/elevator-C_g_6ri-.js","/assets/evals-are-the-operating-system-C6cwf2lS.js","/assets/exploded-CF5pzwKA.js","/assets/format-4-hM9w5q.js","/assets/four-years-of-saturdays-Ct_y6rhW.js","/assets/fraunces-latin-standard-normal-DihXLNYH.woff2","/assets/golden-cases-come-from-funerals-BAduuO13.js","/assets/governor-CTztA1Sr.js","/assets/icons-D-GLO1H3.js","/assets/index-CxIjEbP7.js","/assets/index-DPGwyPfZ.js","/assets/index-hJkr6zPr.css","/assets/keyboard-DpcSKEVY.js","/assets/lantern-F8VWB0I3.js","/assets/links-CLU51XNf.js","/assets/loupe-D0cJa_jI.js","/assets/notebook-CosMRim7.js","/assets/outfit-latin-wght-normal-Bc-8i84L.woff2","/assets/own-your-got-damn-failures-386NsAK2.js","/assets/phosphor-3jG-Hs0S.js","/assets/plot-B8YSqH_D.js","/assets/plug-Do0l2Qg1.js","/assets/points-D6xIgA5K.js","/assets/principles-i-reread-before-starting-anything-new-BsgyyyB2.js","/assets/receipt-CjRlWYOW.js","/assets/relay-BwfZ4xn9.js","/assets/router-BajukSaI.js","/assets/running-two-model-providers-in-production-KUBiBUrx.js","/assets/search-for-languages-the-internet-forgot-8pzoPcSU.js","/assets/settle-BRkQJcOa.js","/assets/sieve-DXg8hWrR.js","/assets/siteSearch-BpwJdkzd.js","/assets/slow-D-qnOrlY.js","/assets/specimens-BYGZvUJv.js","/assets/stack-C_NhWHUv.js","/assets/stop-being-the-thing-inside-the-loop-BkOGHp6j.js","/assets/structured-demand-from-chaos-DyD9hS0q.js","/assets/the-bug-was-in-the-transcript-DpMAnBJb.js","/assets/the-first-two-weeks-are-for-listening-Di4JsbQW.js","/assets/the-model-is-the-easy-part-DWgrFnxe.js","/assets/the-unreasonable-effectiveness-of-cleaning-data-CVpwG_X0.js","/assets/the-voice-agent-tradeoff-CSfg0aY0.js","/assets/toolkit-DTYFstzT.js","/assets/ui-BaX_zA6d.js","/assets/useRailFollowsHeader-yppIIKOJ.js","/assets/utils-BTGVH9Kg.js","/assets/vendor-DzA5IH5n.js","/assets/what-actually-happens-when-you-call-an-llm-api-CYl7VxDA.js","/assets/where-the-human-belongs-in-the-loop-VwVN4T9f.js","/assets/why-output-tokens-cost-more-CXbZQ0s4.js","/assets/writing-down-what-you-didnt-measure-CCrRi4wC.js"];

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
    return (
      (await cache.match(request)) ||
      (await caches.match(request)) ||
      (await caches.match("/offline.html")) ||
      Response.error()
    );
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
