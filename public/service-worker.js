// import { useIndexedDb } from "./indexedDb";

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
  // const { url } = evt.request;
  // const {origin} = evt.;
  //if (!evt.target.origin.includes("api")) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(staticFilesToPreCache);
    })
  );
  // }
  // else {
  //   const eb = 0;
  // }


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

self.addEventListener('offline', function(e) { 
  console.log('offline'); 
  useIndexedDb("budget", DATA_CACHE_NAME, "put", e )
  // const db = await openDB(DATA_CACHE_NAME, 1, {
  //   upgrade(db, oldVersion, newVersion, transaction) {
  //     const store = db.createObjectStore(storeName)
  //   }
  // });
});

self.addEventListener('online', function(e) { 
  console.log('online'); 
});

self.addEventListener("fetch", function (evt) {
  const { url } = evt.request;

  if (url.includes("offline")) {
    evt.respondWith(

      caches.open(DATA_CACHE_NAME).then((cache) => {
        cache.put(evt.request, response.clone());
        return response;


        // caches.open(DATA_CACHE_NAME).then(cache => {
        //   evt.request.json().then(result => {
        //     caches.add(result);

        //     // caches.open(DATA_CACHE_NAME).then((cache) => {
        //     //   const req = new Request(result);
        //     //   cache.add(req);
        //     // });


        //   });
      })


    );
  }

  else {

    if (url.includes("api/transaction") && !url.includes("bulk")) {

      const temp = evt.returnValue;
      const emp2 = evt.target;
      //const temp3 = evt.


      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return cache.match(evt.request).then(response => {

            return response || fetch(evt.request).then((response) => {

              return caches.open(DATA_CACHE_NAME).then((cache) => {
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



