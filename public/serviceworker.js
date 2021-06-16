// will need to cache data requests and pages in this file

// run things offline
// a JS script that gets registered with the browser
// stays registered with browser even when offline
// js script that can load even with no connection
// when service worker is introduced, it adds another level that intercepts the request and decides what to do with the request.

// will need to cache data requests and pages in this file
// service workers are terminated when not in use. need https when pushing to remote server
// life cycle events -- register worker -- install event -- activate event

// call Install event

// version
const cacheName = "v1";
const cacheData = "v1Data";

// array of all pages to cache -- all routes in app -- everything in public folder except service worker.
const cacheAssets = [
  "/",
  "/offlinedb.js",
  "/index.js",
  "/manifest.webmanifest",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];
// attch event listener to worker
self.addEventListener("install", function (event) {
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
self.addEventListener("activate", function (event) {
  console.log("Service Worker: Activated");
  // remove unwanted caches
  event.waitUntil(
    // loop through caches loop through caches and remove any unwanted.
    caches.keys().then((cacheName) => {
      return Promise.all(
        cacheName.map((cache) => {
          if (cache !== cacheName) {
            console.log("Service Worker: Clearing", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// call fetch event -- show cached files if offline

self.addEventListener("fetch", function (event) {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches
        .open(cacheData)
        .then((cache) => {
          return fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }

              return response;
            })
            .catch((err) => {
              return cache.match(event.request);
            });
        })
        .catch((err) => console.log(err))
    );

    return;
  }

  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("/");
        }
      });
    })
  );
});
