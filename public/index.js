
let transactions = [];
let myChart;

fetch("/api/transaction")
  .then(response => {
    return response.json();
  })
  .then(data => {
    // save db data on global variable
    transactions = data;

    populateTotal();
    populateTable();
    populateChart();
  })
  .catch(err => {
    const catcher = 0;
  });

function populateTotal() {
  // reduce transaction amounts to a single total value
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  transactions.forEach(transaction => {
    // create and populate a table row
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;

    tbody.appendChild(tr);
  });
}

function populateChart() {
  // copy array and reverse it
  let reversed = transactions.slice().reverse();
  let sum = 0;

  // create date labels for chart
  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // create incremental values for chart
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });

  // remove old chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: "Total Over Time",
        fill: true,
        backgroundColor: "#6666ff",
        data
      }]
    }
  });
}

function sendTransaction(isAdding) {
  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");

  // validate form
  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  }
  else {
    errorEl.textContent = "";
  }

  // create record
  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString()
  };

  // if subtracting funds, convert amount to negative number
  if (!isAdding) {
    transaction.value *= -1;
  }

  // add to beginning of current array of data
  transactions.unshift(transaction);

  // re-run logic to populate ui with new record
  populateChart();
  populateTable();
  populateTotal();

  // also send to server
  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      if (data.errors) {
        errorEl.textContent = "Missing Information";
      }
      else {
        // clear form
        nameEl.value = "";
        amountEl.value = "";
      }
    })
    .catch(result => {
      // fetch failed, so save in indexed db
      const resul = result;
      saveRecord(transaction);

      // clear form
      nameEl.value = "";
      amountEl.value = "";
    });
}

function saveRecord(transaction) {
  useIndexedDb("budget", "data-cache-v1", "put", transaction).then(myresult => {
    const catcher = 0;
  })
  .catch(err => {
    const catcher = 0;
  });
}

document.querySelector("#add-btn").onclick = function (event) {
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function () {
  sendTransaction(false);
};

window.addEventListener('online', function (e) {
  console.log('online');
  useIndexedDb("budget", "data-cache-v1", "get")
    .then(results => {

      const finalArray = results.map(elem => {

        let transaction = {
          name: elem.name,
          value: elem.value,
          date: elem.date
        };

        return transaction;
      });

      // also send to server
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(finalArray),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => {
          return response.json();
        })
        .then(data => {
          if (data.errors) {
            errorEl.textContent = "Missing Information";
          }
          else {

            fetch("/api/transaction")
              .then(response => {
                return response.json();
              })
              .then(data => {
                // save db data on global variable
                transactions = data;

                populateTotal();
                populateTable();
                populateChart();
                useIndexedDb("budget", "data-cache-v1", "clear");
              })
              .catch(err => {
                const catcher = 0;
              });
          }
        })
        .catch(result => {
          // fetch failed, so save in indexed db
          const resul = result;
          errorEl.textContent = "Missing Information";
          nameEl.value = "";
          amountEl.value = "";
        });
    })
    .catch(err => {
      const catcher = 0;
    });
});


function useIndexedDb(databaseName, storeName, method, object) {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 1);
    let db,
      tx,
      store;

    request.onupgradeneeded = function (e) {
      const db = request.result;
      db.createObjectStore(storeName, { keyPath: "_id", autoIncrement: true });
    };

    request.onerror = function (e) {
      console.log("There was an error");

      db = request.result;
      tx = db.transaction(databaseName, "readwrite");
      store = tx.objectStore(storeName);
      store.autoIncrement = true;
    };

    request.onsuccess = function (e) {
      db = request.result;
      tx = db.transaction(storeName, "readwrite");
      store = tx.objectStore(storeName);

      db.onerror = function (e) {
        console.log("error");
      };
      if (method === "put") {
        store.put(object);
      }
      if (method === "get") {
        const all = store.getAll();
        all.onsuccess = function () {
          resolve(all.result);
        };
      }
      if (method === "clear") {
        store.clear();
      }
      tx.oncomplete = function () {
        db.close();
      };
    };
  });
}
