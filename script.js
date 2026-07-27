// ==========================================
// 1. Elements Selection
// ==========================================
let chartElement = document.querySelector("#chart");
let addTra = document.querySelector("#Add");
let overlay = document.querySelector(".overlay");
let close = document.querySelector("#closeBtn");
let settingCloseBtn = document.querySelector(".close");
let innerSettings = document.querySelector(".inner-settings");
let settings = document.querySelector("#settings");
let cancel = document.querySelector(".cancel");
let saveBtn = document.querySelector(".save");
let transactionUI = document.querySelector(".inside-ui");

let typeInput = document.querySelector("#type-options");
let descInput = document.querySelector("#desc-input");
let amountInput = document.querySelector("#amount-input");
let dateInput = document.querySelector("#date-input");
let categoryInput = document.querySelector("#transaction-category");

let currentBalanceEl = document.querySelector(".current");
let totalIncomeEl = document.querySelector(".total_in");
let totalExpenseEl = document.querySelector(".total_ex");
let totalTransactionsEl = document.querySelector(".total_tra");

let btnAll = document.querySelector("#btn-all");
let btnIncome = document.querySelector("#btn-income");
let btnExpense = document.querySelector("#btn-expense");

const themeCheckbox = document.querySelector(".dark-mode .checkbox");

themeCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("dark-theme-active");
  localStorage.setItem("darkTheme", themeCheckbox.checked);
});

if (localStorage.getItem("darkTheme") === "true") {
  themeCheckbox.checked = true;
  document.body.classList.add("dark-theme-active");
}

let currencyInput =
  document.querySelector("#currency-select") ||
  document.querySelector(".inner-settings select");

// ==========================================
// 2. Chart Setup
// ==========================================
let myChart = new Chart(chartElement, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "Income",
        data: [],
        backgroundColor: "#22c55e",
      },
      {
        label: "Expense",
        data: [],
        backgroundColor: "#ef4444",
      },
    ],
  },
});

// ==========================================
// 3. Global Variables, Local Storage & Helpers
// ==========================================
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let currentCurrencySign = localStorage.getItem("currencySign") || "₹";

let totalIncome = 0;
let totalExpense = 0;
let totalTransactionsCount = 0;
let currentFilter = "All";

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("currencySign", currentCurrencySign);
}

function getSymbol(currencyText) {
  if (!currencyText) return "₹";
  let upperText = currencyText.toUpperCase();
  if (upperText.includes("INR") || upperText.includes("₹")) return "₹";
  if (
    upperText.includes("USD") ||
    upperText.includes("$") ||
    upperText.includes("DOLLAR")
  )
    return "$";
  if (
    upperText.includes("EURO") ||
    upperText.includes("EUR") ||
    upperText.includes("€")
  )
    return "€";
  if (
    upperText.includes("GBP") ||
    upperText.includes("POUND") ||
    upperText.includes("£")
  )
    return "£";
  if (upperText.includes("AED") || upperText.includes("DIRHAM")) return ".د.إ";
  return currencyText.trim().charAt(0);
}

function updateDashboard() {
  totalIncome = 0;
  totalExpense = 0;

  transactions.forEach((t) => {
    if (t.type === "Income") totalIncome += t.amount;
    else totalExpense += t.amount;
  });

  totalTransactionsCount = transactions.length;
  let currentBalance = totalIncome - totalExpense;

  currentBalanceEl.textContent = `${currentCurrencySign} ${currentBalance.toFixed(2)}`;
  totalIncomeEl.textContent = `${currentCurrencySign} ${totalIncome.toFixed(2)}`;
  totalExpenseEl.textContent = `${currentCurrencySign} ${totalExpense.toFixed(2)}`;
  totalTransactionsEl.textContent = totalTransactionsCount;
}

function renderChart() {
  let chartData = {};

  transactions.forEach((t) => {
    if (!chartData[t.date]) {
      chartData[t.date] = { income: 0, expense: 0 };
    }
    if (t.type === "Income") {
      chartData[t.date].income += t.amount;
    } else {
      chartData[t.date].expense += t.amount;
    }
  });

  myChart.data.labels = [];
  myChart.data.datasets[0].data = [];
  myChart.data.datasets[1].data = [];

  for (let date in chartData) {
    myChart.data.labels.push(date);
    myChart.data.datasets[0].data.push(chartData[date].income);
    myChart.data.datasets[1].data.push(chartData[date].expense);
  }

  myChart.update();
}

function renderTransactionsUI(filterType = currentFilter) {
  currentFilter = filterType;

  transactionUI.innerHTML = `
    <div class="h-date" style="font-weight: bold;">Date</div>
    <div class="h-desc" style="font-weight: bold;">Description</div>
    <div class="h-cat" style="font-weight: bold;">Category</div>
    <div class="h-amt" style="font-weight: bold;">Amount</div>
    <div class="h-act" style="font-weight: bold;">Action</div>
  `;

  let filteredTransactions = transactions;
  if (filterType === "Income") {
    filteredTransactions = transactions.filter((t) => t.type === "Income");
  } else if (filterType === "Expense") {
    filteredTransactions = transactions.filter((t) => t.type === "Expense");
  }

  filteredTransactions.forEach((t) => {
    const dateEl = document.createElement("div");
    dateEl.textContent = t.date;

    const descEl = document.createElement("div");
    descEl.textContent = t.desc;

    const catEl = document.createElement("div");
    catEl.textContent = t.category;

    const amtEl = document.createElement("div");
    amtEl.className = "amount-val";
    amtEl.setAttribute("data-amount", t.amount);
    amtEl.textContent = `${currentCurrencySign} ${t.amount.toFixed(2)}`;

    if (t.type === "Income") {
      amtEl.style.color = "green";
      amtEl.style.fontWeight = "600";
    } else {
      amtEl.style.color = "red";
      amtEl.style.fontWeight = "600";
    }

    const actEl = document.createElement("div");
    actEl.innerHTML = `<i class="ri-delete-bin-line delete-btn" style="color: red; cursor: pointer; font-size: 18px;"></i>`;

    actEl.querySelector(".delete-btn").addEventListener("click", function () {
      transactions = transactions.filter(
        (transaction) => transaction.id !== t.id,
      );

      updateLocalStorage();
      updateDashboard();
      renderChart();
      renderTransactionsUI();
    });

    transactionUI.appendChild(dateEl);
    transactionUI.appendChild(descEl);
    transactionUI.appendChild(catEl);
    transactionUI.appendChild(amtEl);
    transactionUI.appendChild(actEl);
  });
}

function init() {
  updateDashboard();
  renderChart();
  renderTransactionsUI();
}

init();

// ==========================================
// 4. Popup (Overlay) & Settings Toggles
// ==========================================
addTra.addEventListener("click", () => {
  overlay.style.display = "flex";
});
close.addEventListener("click", () => {
  overlay.style.display = "none";
});
cancel.addEventListener("click", () => {
  overlay.style.display = "none";
});
settings.addEventListener("click", () => {
  let currentName = document.querySelector("#greet h6").textContent;
  if (settingsNameInput) {
    settingsNameInput.value = currentName;
  }
  let existingBtn = document.querySelector(".name-save-btn");
  if (existingBtn) existingBtn.remove();

  innerSettings.style.display = "flex";
});
settingCloseBtn.addEventListener("click", () => {
  innerSettings.style.display = "none";
});

if (currencyInput) {
  currencyInput.addEventListener("change", function () {
    if (!document.querySelector(".setting-save-btn")) {
      let settingSaveBtn = document.createElement("button");
      settingSaveBtn.textContent = "Save Changes";
      settingSaveBtn.className = "setting-save-btn";

      settingSaveBtn.style.marginTop = "15px";
      settingSaveBtn.style.padding = "8px 16px";
      settingSaveBtn.style.backgroundColor = "#22c55e";
      settingSaveBtn.style.color = "white";
      settingSaveBtn.style.border = "none";
      settingSaveBtn.style.borderRadius = "4px";
      settingSaveBtn.style.cursor = "pointer";
      settingSaveBtn.style.fontWeight = "600";

      settingSaveBtn.addEventListener("click", function () {
        let selectedVal = currencyInput.value;
        let selectedText =
          currencyInput.options[currencyInput.selectedIndex].text;

        currentCurrencySign = getSymbol(selectedVal) || getSymbol(selectedText);

        updateLocalStorage();
        updateDashboard();
        renderTransactionsUI();

        innerSettings.style.display = "none";
        settingSaveBtn.remove();
      });

      currencyInput.parentElement.appendChild(settingSaveBtn);
    }
  });
}

// ==========================================
// 5. Save Transaction Logic
// ==========================================
saveBtn.addEventListener("click", function (event) {
  event.preventDefault();

  let type = typeInput.value;
  let desc = descInput.value;
  let amount = parseFloat(amountInput.value);
  let date = dateInput.value;
  let category = categoryInput.value;

  if (!desc || !amount || !date || !category) {
    alert("Please fill all the details!");
    return;
  }

  if (amount <= 0) {
    alert(
      "The amount cannot be zero or negative. Please enter a valid amount.",
    );
    return;
  }

  const newTransaction = {
    id: Date.now(),
    type: type,
    desc: desc,
    amount: amount,
    date: date,
    category: category,
  };

  transactions.push(newTransaction);

  updateLocalStorage();
  updateDashboard();
  renderChart();
  renderTransactionsUI();

  descInput.value = "";
  amountInput.value = "";
  dateInput.value = "";
  categoryInput.value = "";
  overlay.style.display = "none";
});

// ==========================================
// 6. Filter Buttons Logic
// ==========================================
if (btnAll) {
  btnAll.addEventListener("click", () => renderTransactionsUI("All"));
}
if (btnIncome) {
  btnIncome.addEventListener("click", () => renderTransactionsUI("Income"));
}
if (btnExpense) {
  btnExpense.addEventListener("click", () => renderTransactionsUI("Expense"));
}

// ==========================================
// 7. Settings Name Change Logic
// ==========================================
const settingsNameInput = document.querySelector("#settings-name-input");

if (settingsNameInput) {
  let parentDiv = settingsNameInput.parentElement;

  settingsNameInput.addEventListener("input", () => {
    let currentDashboardName = document
      .querySelector("#greet h6")
      .textContent.trim();
    let typedName = settingsNameInput.value.trim();
    let existingBtn = parentDiv.querySelector(".name-save-btn");

    if (
      typedName !== currentDashboardName &&
      typedName !== "" &&
      !existingBtn
    ) {
      let nameSaveBtn = document.createElement("button");
      nameSaveBtn.textContent = "Save Changes";
      nameSaveBtn.className = "name-save-btn";

      nameSaveBtn.style.marginTop = "15px";
      nameSaveBtn.style.padding = "8px 16px";
      nameSaveBtn.style.backgroundColor = "#22c55e";
      nameSaveBtn.style.color = "white";
      nameSaveBtn.style.border = "none";
      nameSaveBtn.style.borderRadius = "4px";
      nameSaveBtn.style.cursor = "pointer";
      nameSaveBtn.style.fontWeight = "600";

      nameSaveBtn.addEventListener("click", function () {
        let newName = settingsNameInput.value.trim();

        if (newName !== "") {
          document.querySelector("#greet h6").textContent = newName;

          let circleEl = document.querySelector(".circle");
          if (circleEl && typeof getInitials === "function") {
            circleEl.textContent = getInitials(newName);
          }

          alert("Profile name updated successfully!");
          innerSettings.style.display = "none";
        }

        nameSaveBtn.remove();
      });

      parentDiv.appendChild(nameSaveBtn);
    } else if (typedName === currentDashboardName && existingBtn) {
      existingBtn.remove();
    }
  });
}

// ==========================================
// 8. Sign Up & Login Switching Logic
// ==========================================
const loginSection = document.querySelector("#login-section");
const signupSection = document.querySelector("#signup-section");
const showSignupLink = document.querySelector("#show-signup");
const showLoginLink = document.querySelector("#show-login");
const loginBtn = document.querySelector("#login-btn");
const signupBtn = document.querySelector("#signup-btn");

const profileNameDisplay = document.querySelector("#greet h6");
const profileCircleDisplay = document.querySelector(".circle");

function getInitials(name) {
  let parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0] !== "") {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return "U";
}

if (localStorage.getItem("isLoggedIn") === "true") {
  if (loginSection) loginSection.style.display = "none";
  if (signupSection) signupSection.style.display = "none";
}

if (showSignupLink && loginSection && signupSection) {
  showSignupLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginSection.style.display = "none";
    signupSection.style.display = "flex";
  });
}

if (showLoginLink && loginSection && signupSection) {
  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    signupSection.style.display = "none";
    loginSection.style.display = "flex";
  });
}

if (loginBtn && loginSection) {
  loginBtn.addEventListener("click", () => {
    let nameVal = document.querySelector("#login-name").value.trim();
    let passVal = document.querySelector("#login-pass").value.trim();

    if (nameVal === "" || passVal === "") {
      alert("Please enter both Username and Password!");
      return;
    }

    if (profileNameDisplay) profileNameDisplay.textContent = nameVal;
    if (profileCircleDisplay)
      profileCircleDisplay.textContent = getInitials(nameVal);

    localStorage.setItem("isLoggedIn", "true");
    loginSection.style.display = "none";
  });
}

if (signupBtn && signupSection) {
  signupBtn.addEventListener("click", () => {
    let nameVal = document.querySelector("#signup-name").value.trim();
    let emailVal = document.querySelector("#signup-email").value.trim();
    let passVal = document.querySelector("#signup-pass").value.trim();

    if (nameVal === "" || emailVal === "" || passVal === "") {
      alert("Please fill all the details to create an account!");
      return;
    }

    if (profileNameDisplay) profileNameDisplay.textContent = nameVal;
    if (profileCircleDisplay)
      profileCircleDisplay.textContent = getInitials(nameVal);

    localStorage.setItem("isLoggedIn", "true");
    signupSection.style.display = "none";
  });
}

// ==========================================
// 9. Passwords Show/Hide Logic
// ==========================================
const toggleEye = document.querySelector("#toggleEye");
const loginPassInput = document.querySelector("#login-pass");

if (toggleEye && loginPassInput) {
  toggleEye.addEventListener("click", () => {
    if (loginPassInput.type === "password") {
      loginPassInput.type = "text";
      toggleEye.classList.remove("ri-eye-off-line");
      toggleEye.classList.add("ri-eye-line");
    } else {
      loginPassInput.type = "password";
      toggleEye.classList.remove("ri-eye-line");
      toggleEye.classList.add("ri-eye-off-line");
    }
  });
}

const toggleSignupEye = document.querySelector("#toggleSignupEye");
const signupPassInput = document.querySelector("#signup-pass");

if (toggleSignupEye && signupPassInput) {
  toggleSignupEye.addEventListener("click", () => {
    if (signupPassInput.type === "password") {
      signupPassInput.type = "text";
      toggleSignupEye.classList.remove("ri-eye-off-line");
      toggleSignupEye.classList.add("ri-eye-line");
    } else {
      signupPassInput.type = "password";
      toggleSignupEye.classList.remove("ri-eye-line");
      toggleSignupEye.classList.add("ri-eye-off-line");
    }
  });
}

let logoutBtn = document.querySelector("#logout");
if (logoutBtn && loginSection) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    loginSection.style.display = "flex";
  });
}

// ==========================================
// 10. Reset All Data Logic
// ==========================================
const resetBtn = document.querySelector("#resetBtn");

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    let confirmReset = confirm(
      "Are you sure you want to delete all data and reset the app?",
    );

    if (confirmReset) {
      localStorage.clear();
      window.location.reload();
    }
  });
}
