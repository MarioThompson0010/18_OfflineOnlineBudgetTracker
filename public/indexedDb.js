// Need webpack to do this.  Ran out of time.
// function useIndexedDb(databaseName, storeName, method, object) {
//   return new Promise((resolve, reject) => {
//     const request = window.indexedDB.open(databaseName, 1);
//     let db,
//       tx,
//       store;

//     request.onupgradeneeded = function (e) {
//       const db = request.result;
//       db.createObjectStore(storeName, { keyPath: "_id", autoIncrement: true });
//     };

//     request.onerror = function (e) {
//       console.log("There was an error");

//       db = request.result;
//       tx = db.transaction(databaseName, "readwrite");
//       store = tx.objectStore(storeName);
//       store.autoIncrement = true;
//     };

//     request.onsuccess = function (e) {
//       db = request.result;
//       tx = db.transaction(storeName, "readwrite");
//       store = tx.objectStore(storeName);

//       db.onerror = function (e) {
//         console.log("error");
//       };
//       if (method === "put") {
//         store.put(object);
//       }
//       if (method === "get") {
//         const all = store.getAll();
//         all.onsuccess = function () {
//           resolve(all.result);
//         };
//       }
//       if (method === "clear") {
//         store.clear();
//       }
//       tx.oncomplete = function () {
//         db.close();
//       };
//     };
//   });
// }
// // module.exports = indexeddb;
