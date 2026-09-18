import { translations } from "../i18n/index.js";

export const APP_VERSION = "4.3.1";
export const GITHUB_REPO = "rayhanrafifweb/Moonlight";
export const UPDATE_CHECK_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
export const REPO_URL = `https://github.com/${GITHUB_REPO}`;

export let currentLang = localStorage.getItem("mori_lang") || "en";
export function setCurrentLang(v) {
  currentLang = v;
}

export const t = (key) =>
  (translations[currentLang] || translations.en)?.[key] || key;

export function openExternalUrl(targetUrl) {
  try {
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  } catch (e) {
    console.error("Open URL error:", e);
  }
}
