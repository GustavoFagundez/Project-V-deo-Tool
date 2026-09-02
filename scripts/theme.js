/* =========================================================
   theme.js
   Handles light/dark theme switching.
   Theme choice is saved in localStorage under THEME_STORAGE_KEY.
   ========================================================= */

const THEME_STORAGE_KEY = "videotool-theme";

function getStoredTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY);
}

function getPreferredTheme() {
  const stored = getStoredTheme();
  if (stored) return stored;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const toggleButton = document.getElementById("theme-toggle");
  if (toggleButton) {
    toggleButton.setAttribute("aria-pressed", theme === "dark");
    toggleButton.textContent = theme === "dark" ? "Modo claro" : "Modo escuro";
  }
}

function setTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
}

// Apply theme as early as possible to avoid a flash of the wrong theme.
applyTheme(getPreferredTheme());

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("theme-toggle");
  if (toggleButton) {
    toggleButton.addEventListener("click", toggleTheme);
  }
});
