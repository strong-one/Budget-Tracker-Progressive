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
self.addEventListener("install", (event) => {
  console.log("service worker installed");
});
