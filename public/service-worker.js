const CACHE_NAME = "static-cache-v2"; // files, not data
const DATA_CACHE_NAME = "data-cache-v1"; // data

const iconSizes = ["192", "512"];
const iconFiles = iconSizes.map(
  (size) => `/icons/icon-${size}x${size}.png`
);

const staticFilesToPreCache = [
  "/",
  "/index.js",
  "/manifest.webmanifest",
].concat(iconFiles);


// install
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(staticFilesToPreCache);
    })
  );

  self.skipWaiting();
});

// activate
self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", function (evt) {
  const { url } = evt.request;

  // this never gets used and doesn't work, but I'm running out of time! It doesn't get called anyway.
  if (url.includes("offline")) {
    evt.respondWith(

      caches.open(DATA_CACHE_NAME).then((cache) => {
        cache.put(evt.request, response.clone());
        return response;
      })
    );
  }
  else {

    if (url.includes("api/transaction") && !url.includes("bulk")) {

      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return cache.match(evt.request).then(response => {

            return response || fetch(evt.request).then((response) => {

              return caches.open(DATA_CACHE_NAME).then((cache) => {
                // if you were using a different type of storage, it would go here:
                // cache.put(evt.request, response.clone());
                return response;
              });
            });
          });
        })
      );

    } else {
      // respond from static cache, request is not for /api/*
      evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
          return cache.match(evt.request).then(response => {
            return response || fetch(evt.request);
          });
        })
      );
    }
  }
});

// Use webpack to put this in a separate file
function useIndexedDb(databaseName, storeName, method, object) {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 1);
    let db,
      tx,
      store;

    request.onupgradeneeded = function(e) {
      const db = request.result;
      db.createObjectStore(storeName, { keyPath: "_id" });
    };

    request.onerror = function(e) {
      console.log("There was an error");
    };

    request.onsuccess = function(e) {
      db = request.result;
      tx = db.transaction(storeName, "readwrite");
      store = tx.objectStore(storeName);

      db.onerror = function(e) {
        console.log("error");
      };
      if (method === "put") {
        store.put(object);
      }
      if (method === "clear") {
        store.clear();
      }
      if (method === "get") {
        const all = store.getAll();
        all.onsuccess = function() {
          resolve(all.result);
        };
      }
      tx.oncomplete = function() {
        db.close();
      };
    };
  });
}



