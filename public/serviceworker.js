// will need to cache data requests and pages in this file

// run things offline
// a JS script that gets registered with the browser
// stays registered with browser even when offline
// js script that can load even with no connection from cached data
// when service worker is introduced, it adds another level that intercepts the request and decides what to do with the request.

// will need to cache data requests and pages in this file
// service workers are terminated when not in use. need https when pushing to remote server
// life cycle events -- register worker -- install event -- activate event

// call Install event

// version
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/offlinedb.js",
  "/index.js",
  "/manifest.webmanifest",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// variables to store names of cache
// industry standard to uppercase the variables but I can call whatever I want
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// steps of service worker -- regristration -- install, activate, waiting

// 3 parts to service worker
// Installation
// Waiting
// Activation

// install -- open cache and install files in that cache so csn brower app offline
//self --  represents scope of service worker -- access to entire application if in public folder
self.addEventListener("install", function (event) {
  event.waitUntil(
    // 1. open a cache (variable name)
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Your files were pre-cached successfully!");
      // adding all files to cache
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // goes from waiting to active -- goes directly to activation
  self.skipWaiting();
});

// manage old caches(versions) -- if changes are made to service worker this will update to new version with new version and any added items to array
self.addEventListener("activate", function (event) {
  // waiting until all data is cached, once done will run rest of code block
  event.waitUntil(
    // mapping over array of cache keys removing old cache if name and data name does not match key
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // claim method caused pages to be controlled immediately and new service worker will take over
  self.clients.claim();
});

// fetch
// service workers can listen for fetch events -- anytime a fetch event kicks off the service worker sill kick off this callback function
self.addEventListener("fetch", function (event) {
  // cache successful requests to the API
  // if the user request includes the path /api/ then kick off callback
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      // open cache, and run fetch based on whatever request came in, attempting to fetch the resource.
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(event.request)
            .then((response) => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }

              return response;
            })
            .catch((err) => {
              // if offline, try to get it from the cache.
              return cache.match(event.request);
            });
        })
        // catch any errors
        .catch((err) => console.log(err))
    );

    return;
  }

  // if the request is not for the API, serve static assets using "offline-first" approach.

  // offline first approach -- if offline serve static files/assets
  event.respondWith(
    // when a request is made does it match?
    caches.match(event.request).then(function (response) {
      // if offline is file requested check in cache ||  fetch the file requested if online
      return response || fetch(event.request);
    })
  );
});
