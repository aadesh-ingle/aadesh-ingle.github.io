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
const CACHE_VERSION = "vpmhge0";
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
  "/assets/index-B0woOlmF.js",
  "/assets/index-BoShaESz.css",
  "/assets/router-BajukSaI.js",
  "/assets/ui-BaX_zA6d.js",
  "/assets/utils-BTGVH9Kg.js",
  "/assets/vendor-DzA5IH5n.js",
];

// Every hashed file this build ships (injected by sw-manifest.mjs). Used only
// to prune ASSET_CACHE of files from older builds, never to fetch.
const BUILD_ASSETS = ["/assets/About--TsRncbL.js","/assets/ArticleCard-ogY2XZcK.js","/assets/ArticleFigure-Dr5AvGyp.js","/assets/BackToTop-C_pl7F_N.js","/assets/Blog-CzuTagQV.js","/assets/BlogPost-4uq2oYZh.js","/assets/Books-D551DwSv.js","/assets/Breadcrumbs-D7WRkyds.js","/assets/CommandPalette-B9LNhCwT.js","/assets/CommandPalette-k2q6n2xy.css","/assets/Gallery-daBsmvuX.js","/assets/List-DQJkuD6w.js","/assets/NotFound-ByOERdt_.js","/assets/Tag-C4rDD5oX.js","/assets/TagPage-DABvuh9i.js","/assets/Toolkit-CMCXQMMw.css","/assets/Toolkit-CdS_BG73.js","/assets/article-DQYm7CHm.css","/assets/articleFigures-CFnTac2V.js","/assets/basket-Dgm929es.js","/assets/bleu-lies-Cp-pHEFH.js","/assets/books-BqwqEZlj.js","/assets/branches-CCLY526_.js","/assets/cabinet-BW6aj4Ad.js","/assets/calipers-DgqKgLV5.js","/assets/cards-tZt4dCZc.js","/assets/collectionModel-D6EQYI4a.js","/assets/demos-close-deals-boring-systems-keep-them-DfQ07Ujz.js","/assets/dialog-D3e9Bmmq.js","/assets/dish-BK6zD-tA.js","/assets/drawer-DVrs-qBp.js","/assets/elevator-DhoFo6lg.js","/assets/evals-are-the-operating-system-T75ijifn.js","/assets/exploded-wnmqP1uj.js","/assets/format-BXiP3Het.js","/assets/four-years-of-saturdays-Ct_y6rhW.js","/assets/fraunces-latin-standard-normal-DihXLNYH.woff2","/assets/golden-cases-come-from-funerals-CQUGf2nc.js","/assets/governor-CffAlCw6.js","/assets/icons-D-GLO1H3.js","/assets/index-B0woOlmF.js","/assets/index-BoShaESz.css","/assets/index-DPGwyPfZ.js","/assets/keyboard-6C11rSTl.js","/assets/lantern-jjRWsCYT.js","/assets/links-BqLYUoiJ.js","/assets/loupe-CG8CYJqQ.js","/assets/notebook-Aenb2Zwk.js","/assets/outfit-latin-wght-normal-Bc-8i84L.woff2","/assets/own-your-got-damn-failures-CDbyfd05.js","/assets/phosphor-Cads1jFL.js","/assets/plot-orAKUYR0.js","/assets/plug-Drj4KoiF.js","/assets/points-62W741fA.js","/assets/principles-i-reread-before-starting-anything-new-Ck_pUngH.js","/assets/receipt-D4SkzGuN.js","/assets/relay-22fFrnWX.js","/assets/router-BajukSaI.js","/assets/running-two-model-providers-in-production-W6ydj9w-.js","/assets/search-for-languages-the-internet-forgot-lgeovACA.js","/assets/settle-Bujd5aWR.js","/assets/sieve-B9w8P2kU.js","/assets/siteSearch-Cc5Prt_m.js","/assets/slow-CtV3rKjZ.js","/assets/specimens-ChCDduAB.js","/assets/stack-D0VEy38L.js","/assets/stop-being-the-thing-inside-the-loop-HaIiv1t-.js","/assets/structured-demand-from-chaos-DnDAGrp-.js","/assets/the-bug-was-in-the-transcript-Cievapt5.js","/assets/the-first-two-weeks-are-for-listening-BnDo-Mo9.js","/assets/the-model-is-the-easy-part-C6YHRo4T.js","/assets/the-unreasonable-effectiveness-of-cleaning-data-D6W6ngqp.js","/assets/the-voice-agent-tradeoff-Dyhd6vRe.js","/assets/toolkit-DTYFstzT.js","/assets/ui-BaX_zA6d.js","/assets/useRailFollowsHeader-yppIIKOJ.js","/assets/utils-BTGVH9Kg.js","/assets/vendor-DzA5IH5n.js","/assets/what-actually-happens-when-you-call-an-llm-api-CS4g8FJQ.js","/assets/where-the-human-belongs-in-the-loop-CsX7iVkj.js","/assets/why-output-tokens-cost-more-d6JeYwsM.js","/assets/writing-down-what-you-didnt-measure-BW1Y_nFq.js"];

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

// Pages: the network first, so a deploy shows at once, but a page this
// device has seen before never waits on a weak signal. After
// NAVIGATION_TIMEOUT_MS the cached copy is served while the network finishes
// in the background and refreshes the cache for next time. With nothing
// cached it keeps waiting, then falls back to /offline.html.
const NAVIGATION_TIMEOUT_MS = 3000;
const networkFirst = async (event, cacheName) => {
  const { request } = event;
  const cache = await caches.open(cacheName);
  const network = (async () => {
    const response = (await Promise.resolve(event.preloadResponse)) || (await fetch(request));
    if (response.ok) {
      await cache.put(request, response.clone());
      trimCache(cacheName, MAX_PAGE_CACHE_ENTRIES);
    }
    return response;
  })();
  event.waitUntil(network.catch(() => {}));
  const cached = () => cache.match(request).then((hit) => hit || caches.match(request));
  let timer;
  const slow = new Promise((resolve) => {
    timer = setTimeout(() => resolve(cached().then((hit) => hit || network)), NAVIGATION_TIMEOUT_MS);
  });
  try {
    return await Promise.race([network, slow]);
  } catch {
    return (await cached()) || (await caches.match("/offline.html")) || Response.error();
  } finally {
    clearTimeout(timer);
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
    event.respondWith(networkFirst(event, PAGE_CACHE));
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
