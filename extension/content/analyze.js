const LEGAL_URL_PATTERNS = [
  "terms", "privacy", "/legal", "/tos", "eula",
  "cookie-policy", "conditions", "disclaimer",
];
const LEGAL_TITLE_PATTERNS = [
  "terms of service", "terms and conditions", "privacy policy",
  "cookie policy", "user agreement", "eula", "end user license",
];
const MODES = [
  { id: "summary",    label: "Summary" },
  { id: "bullets",    label: "Bullets" },
  { id: "risk_flags", label: "Risk Flags" },
  { id: "risk_score", label: "Risk Score" },
];
const MAX_TEXT_LENGTH = 50_000;

// ----- Detection -----

function isLegalPage() {
  const url = window.location.href.toLowerCase();
  const title = document.title.toLowerCase();
  return (
    LEGAL_URL_PATTERNS.some((p) => url.includes(p)) ||
    LEGAL_TITLE_PATTERNS.some((p) => title.includes(p))
  );
}

function extractPageText() {
  const candidates = [
    document.querySelector("main"),
    document.querySelector("article"),
    document.querySelector('[role="main"]'),
    document.querySelector(".content"),
    document.querySelector("#content"),
    document.body,
  ];
  const el = candidates.find(Boolean);
  return (el?.innerText ?? "").slice(0, MAX_TEXT_LENGTH).trim();
}

// ----- Sidebar -----

let host = null;
let shadow = null;
const tabState = {};
MODES.forEach((m) => (tabState[m.id] = { status: "idle", result: null }));
let activeTab = MODES[0].id;

function buildSidebar() {
  host = document.createElement("div");
  host.id = "bbgone-host";
  document.body.appendChild(host);

  shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = getSidebarStyles();
  shadow.appendChild(style);

  const sidebar = document.createElement("div");
  sidebar.id = "sidebar";
  sidebar.innerHTML = getSidebarHTML();
  shadow.appendChild(sidebar);

  shadow.querySelector("#close-btn").addEventListener("click", closeSidebar);
  shadow.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.mode));
  });

  renderTabContent(activeTab);
}

function getSidebarHTML() {
  const tabs = MODES.map(
    (m) => `<button class="tab-btn${m.id === activeTab ? " active" : ""}" data-mode="${m.id}">${m.label}</button>`
  ).join("");
  return `
    <div id="header">
      <span id="title">Beaurocracy B'Gone</span>
      <button id="close-btn" title="Close">✕</button>
    </div>
    <div id="tabs">${tabs}</div>
    <div id="content"></div>
  `;
}

function switchTab(mode) {
  activeTab = mode;
  shadow.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  renderTabContent(mode);
}

function renderTabContent(mode) {
  const content = shadow.querySelector("#content");
  const state = tabState[mode];

  if (state.status === "idle") {
    content.innerHTML = `
      <div class="idle-state">
        <p>Ready to analyse this page.</p>
        <button id="analyze-btn">Analyse</button>
      </div>`;
    shadow.querySelector("#analyze-btn").addEventListener("click", () => runAnalysis(mode));
    return;
  }
  if (state.status === "loading") {
    content.innerHTML = `<div class="loading"><div class="spinner"></div><p>Analysing…</p></div>`;
    return;
  }
  if (state.status === "error") {
    content.innerHTML = `<div class="error"><p>${escapeHtml(state.result)}</p></div>`;
    return;
  }
  content.innerHTML = `<div class="result">${renderMarkdown(state.result)}</div>`;
}

async function runAnalysis(mode) {
  tabState[mode].status = "loading";
  renderTabContent(mode);

  const text = extractPageText();
  const response = await chrome.runtime.sendMessage({ type: "ANALYZE", text, mode });

  if (response.error) {
    tabState[mode] = { status: "error", result: response.error };
  } else {
    tabState[mode] = { status: "done", result: response.result };
  }
  if (activeTab === mode) renderTabContent(mode);
}

function openSidebar() {
  if (!shadow) buildSidebar();
  shadow.querySelector("#sidebar").classList.add("open");
  document.body.style.marginRight = "400px";
}

function closeSidebar() {
  shadow.querySelector("#sidebar").classList.remove("open");
  document.body.style.marginRight = "";
}

function buildTriggerButton() {
  if (document.getElementById("bbgone-trigger")) return;
  const btn = document.createElement("button");
  btn.id = "bbgone-trigger";
  btn.textContent = "⚖️ Analyse";
  btn.addEventListener("click", openSidebar);
  document.body.appendChild(btn);
}

function getSidebarStyles() {
  return `
    #sidebar {
      position: fixed; top: 0; right: -400px; width: 380px; height: 100vh;
      background: #fff; box-shadow: -4px 0 24px rgba(0,0,0,0.12);
      display: flex; flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px; color: #1a1a1a; transition: right 0.3s ease;
      z-index: 2147483647; box-sizing: border-box;
    }
    #sidebar.open { right: 0; }
    #header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px; background: #1a1a2e; color: #fff; flex-shrink: 0;
    }
    #title { font-weight: 600; font-size: 15px; }
    #close-btn { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; padding: 0 4px; line-height: 1; }
    #tabs { display: flex; border-bottom: 1px solid #e5e7eb; flex-shrink: 0; }
    .tab-btn {
      flex: 1; padding: 10px 4px; border: none; background: none;
      font-size: 12px; font-weight: 500; color: #6b7280; cursor: pointer;
      border-bottom: 2px solid transparent; transition: color 0.15s, border-color 0.15s;
    }
    .tab-btn:hover { color: #1a1a2e; }
    .tab-btn.active { color: #1a1a2e; border-bottom-color: #1a1a2e; }
    #content { flex: 1; overflow-y: auto; padding: 16px; }
    .idle-state { text-align: center; padding: 32px 16px; }
    .idle-state p { color: #6b7280; margin-bottom: 16px; }
    #analyze-btn {
      background: #1a1a2e; color: #fff; border: none; padding: 10px 24px;
      border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;
    }
    #analyze-btn:hover { background: #2d2d4e; }
    .loading { display: flex; flex-direction: column; align-items: center; padding: 48px 16px; color: #6b7280; }
    .spinner {
      width: 28px; height: 28px; border: 3px solid #e5e7eb;
      border-top-color: #1a1a2e; border-radius: 50%;
      animation: spin 0.7s linear infinite; margin-bottom: 12px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error { padding: 16px; background: #fef2f2; border-radius: 8px; color: #b91c1c; }
    .result { line-height: 1.6; }
    .result p { margin: 0 0 12px; }
    .result ul { margin: 0 0 12px; padding-left: 20px; }
    .result li { margin-bottom: 6px; }
    .result strong { font-weight: 600; }
  `;
}

// ----- Init -----

if (isLegalPage()) buildTriggerButton();

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "OPEN_SIDEBAR") {
    buildTriggerButton();
    openSidebar();
  }
});
