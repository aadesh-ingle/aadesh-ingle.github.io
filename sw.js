const CACHE_NAME = "aadesh-blog-v1";
const urlsToCache = [
  "/",
  "/src/main.tsx",
  "/src/index.css",
  "/profile.jpg",
  "/img/own-your-got-damn-failures.webp",
  "/img/neural-networks.webp",
  "/img/designing-ethical-ai-systems.webp",
  "/img/future-of-nlp.webp",
  "/img/optimizing-deep-learning-models.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    })
  );
});
