/* =========================================================
   app.js
   Shared behaviour for every logged-in page (Studio + Tools).
   Most functions below are placeholders — implement the real
   logic (auth, database, API calls) as you build the back-end.
   ========================================================= */

const DATABASE_PATH = "../database/database.json"; // adjust if you move the file

/* ---------- Database (placeholder) ---------- */
// TODO: replace with real requests to your back-end / database.
async function loadDatabase() {
  try {
    const response = await fetch(DATABASE_PATH);
    return await response.json();
  } catch (error) {
    console.error("Could not load database.json:", error);
    return null;
  }
}

/* ---------- Header: search ---------- */
function initSearch() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.trim();
    // TODO: filter sidebar tools/functions by "query".
  });
}

/* ---------- Header: token balance ---------- */
function initTokenBalance() {
  const tokenBalanceEl = document.getElementById("token-balance");
  if (!tokenBalanceEl) return;

  // TODO: fetch the real balance for the logged-in user.
  const placeholderBalance = tokenBalanceEl.dataset.placeholder || "0";
  tokenBalanceEl.textContent = placeholderBalance;
}

/* ---------- Header: logout ---------- */
function initLogout() {
  const logoutButton = document.getElementById("logout-btn");
  if (!logoutButton) return;

  logoutButton.addEventListener("click", () => {
    // TODO: clear session/token and redirect to the login page.
    window.location.href = "/Authentication/login.html";
  });
}

/* ---------- Sidebar: highlight current page ---------- */
function initActiveSidebarLink() {
  const currentFile = window.location.pathname.split("/").pop();
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    if (link.getAttribute("href") && link.getAttribute("href").endsWith(currentFile)) {
      link.classList.add("is-active");
    }
  });
}

/* ---------- Footer actions: import / export / print ---------- */
function initFooterActions() {
  const importButton = document.getElementById("import-btn");
  const exportButton = document.getElementById("export-btn");
  const printButton = document.getElementById("print-btn");

  if (importButton) {
    importButton.addEventListener("click", () => {
      // TODO: implement import flow (file picker, parsing, etc.)
    });
  }

  if (exportButton) {
    exportButton.addEventListener("click", () => {
      // TODO: implement export flow (download current result/project).
    });
  }

  if (printButton) {
    printButton.addEventListener("click", () => {
      window.print();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initSearch();
  initTokenBalance();
  initLogout();
  initActiveSidebarLink();
  initFooterActions();
});
