// will need to cache data requests and pages in this file

// run things offline
// a JS script that gets registered with the browser
// stays registered with browser even when offline
// js script that can load even with no connection
// when service worker is introduced, it adds another level that intercepts the request and decides what to do with the request.

// will need to cache data requests and pages in this file
// service workers are terminated when not in use. need https when pushing to remote server
// life cycle events -- register worker -- install event -- activate event
// functional events fetch -- sync

// call Install event

// version
const cacheName = "v1";
// array of all pages to cache -- all routes in app -- everything in public folder except service worker.
const cacheAssets = [
  "/",
  "/offlinedb.js",
  "/index.js",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];
// attch event listener to worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  event.waitUntil(
    // open cache by my cacheName variable
    caches
      .open(cacheName)
      .then((cache) => {
        console.log("Service Worker: Caching Files");
        // adding all files in cache to cacheAssets -- can use variable or put array directly in parameter
        cache.addAll(cacheAssets);
      })
      .then(() => self.skipWaiting())
  );
});

// call activate event -- get rid of any old cache
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  // remove unwanted caches
  event.waitUntil(
    // loop through caches loop through caches and remove any unwanted.
    caches.keys().then((cacheName) => {
      return Promise.all(
        cacheName.map((cache) => {
          if (cache !== cacheName) {
            console.log("Service Worker: Clearing");
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// call fetch event -- show cached files if offline

self.addEventListener("fetch", (event) => {
  console.log("Service Worker: Fetching");
  event.respondWith(
    // fetch will grab the event -- .catch, is if there is no service then will pull from cache
    // fetch(event.request).catch(() => caches.match(event.request))
    fetch(event.request)
      .then((response) => {
        // make copy of response
        const resCopy = response.clone();
        // open a cache
        cache.open(cacheName).then((cache) => {
          // add response to cache
          cache.put(event.request, resCopy);
        });
        return response;
        // if connection drops then .catch runs
      })
      .catch((err) => caches.match(event.request).then((response) => response))
  );
});
