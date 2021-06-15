// queue db

let db;

const request = indexedDB.open("budgetList", 1);

request.onupgradeneeded = function (event) {
  // create object store called "BudgetStore" and set autoIncrement to true
  const db = event.target.result;
  db.createObjectStore("budgetStore", { autoIncrement: true });
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
  const save = transaction.objectStore("pending");
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
        .then((response) => response.json())
        .then((res) => {
          // If our returned response is not empty if length is not equal to zero open budget store and clear out
          if (res.length !== 0) {
            // Open another transaction to BudgetStore with the ability to read and write
            transaction = db.transaction(["budgetStore"], "readwrite");

            // Assign the current store to a variable
            const currentStore = transaction.objectStore("budgetStore");

            // Clear existing entries because our bulk add was successful
            currentStore.clear();
            console.log("Clearing Store");
          }
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
