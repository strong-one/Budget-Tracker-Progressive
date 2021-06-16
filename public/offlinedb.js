// queue db

let db;

const request = window.indexedDB.open("budgetList", 1);

request.onupgradeneeded = function (event) {
  // create object store called "BudgetStore" and set autoIncrement to true
  const db = event.target.result;
  db.createObjectStore("budgetStore", { autoIncrement: true });
  // objectStore.createIndex("pending", "pending");
};

request.onsuccess = function (event) {
  console.log("success");
  db = event.target.result;

  // navigator - window object -- checking if user is online
  if (navigator.onLine) {
    console.log("Backend Online");
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
  console.log("someting went wrong");
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["budgetStore"], "readwrite");
  // access your pending object store
  const save = transaction.objectStore("budgetStore");
  // add record to your store with add method.
  save.add(record);
}

function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(["budgetStore"], "readwrite");
  // access your pending object store
  const save = transaction.objectStore("budgetStore");
  // get all records from store and set to a variable
  const getAll = save.getAll();
  // once online -- all offline user data will be posted to database
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then(() => {
          // deleting stores apon success
          const saveInfo = db.transaction("budgetStore", "readwrite");
          const store = saveInfo.objectStore("budgetStore");
          store.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
