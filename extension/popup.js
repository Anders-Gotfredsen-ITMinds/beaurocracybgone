const LEGAL_URL_PATTERNS = [
  "terms", "privacy", "/legal", "/tos", "eula",
  "cookie-policy", "conditions", "disclaimer",
];
const LEGAL_TITLE_PATTERNS = [
  "terms of service", "terms and conditions", "privacy policy",
  "cookie policy", "user agreement", "eula", "end user license",
];
const VIDEO_URL_PATTERNS = [
  /youtube\.com\/watch/,
  /youtu\.be\//,
  /instagram\.com\/(reel|p)\//,
  /tiktok\.com\/@.+\/video\//,
];

function isLegalPage(url, title) {
  const u = url.toLowerCase();
  const t = title.toLowerCase();
  return (
    LEGAL_URL_PATTERNS.some((p) => u.includes(p)) ||
    LEGAL_TITLE_PATTERNS.some((p) => t.includes(p))
  );
}

function isVideoPage(url) {
  return VIDEO_URL_PATTERNS.some((p) => p.test(url));
}

document.getElementById("options-link").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

document.getElementById("analyze-btn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.tabs.sendMessage(tab.id, { type: "OPEN_SIDEBAR" });
  window.close();
});

document.getElementById("factcheck-btn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.tabs.sendMessage(tab.id, { type: "OPEN_FC_SIDEBAR" });
  window.close();
});

(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const statusEl = document.getElementById("status");
  const analyzeBtn = document.getElementById("analyze-btn");
  const factcheckBtn = document.getElementById("factcheck-btn");

  if (isLegalPage(tab.url, tab.title)) {
    statusEl.innerHTML = `<span class="badge detected">Legal page detected</span>
      <p>Use the ⚖️ button on the page, or click below to open the analyser.</p>`;
    analyzeBtn.classList.remove("hidden");
  } else if (isVideoPage(tab.url)) {
    statusEl.innerHTML = `<span class="badge video">Video detected</span>
      <p>Use the 🎥 button on the page, or click below to fact-check this video.</p>`;
    factcheckBtn.classList.remove("hidden");
  } else {
    statusEl.innerHTML = `<span class="badge not-detected">Nothing detected</span>
      <p>Navigate to a Terms of Service page or a YouTube video to get started.</p>`;
  }
})();
