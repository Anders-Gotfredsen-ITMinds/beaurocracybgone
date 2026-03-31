const VIDEO_URL_PATTERNS = [
  /youtube\.com\/watch/,
  /youtu\.be\//,
  /instagram\.com\/(reel|p)\//,
  /tiktok\.com\/@.+\/video\//,
];

const VERDICT_CONFIG = {
  True:      { label: "True",      color: "#065f46", bg: "#d1fae5" },
  False:     { label: "False",     color: "#991b1b", bg: "#fee2e2" },
  Uncertain: { label: "Uncertain", color: "#92400e", bg: "#fef3c7" },
  Opinion:   { label: "Opinion",   color: "#1e3a5f", bg: "#dbeafe" },
};

// ----- Detection -----

function isVideoPage() {
  return VIDEO_URL_PATTERNS.some((p) => p.test(window.location.href));
}

// ----- Sidebar -----

let fcHost = null;
let fcShadow = null;
let fcState = { status: "idle", claims: null, error: null };

function buildFcSidebar() {
  fcHost = document.createElement("div");
  fcHost.id = "bbgone-fc-host";
  document.body.appendChild(fcHost);

  fcShadow = fcHost.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = getFcSidebarStyles();
  fcShadow.appendChild(style);

  const sidebar = document.createElement("div");
  sidebar.id = "fc-sidebar";
  sidebar.innerHTML = `
    <div id="fc-header">
      <span id="fc-title">🎥 Fact Checker</span>
      <button id="fc-close-btn" title="Close">✕</button>
    </div>
    <div id="fc-content"></div>
  `;
  fcShadow.appendChild(sidebar);

  fcShadow.querySelector("#fc-close-btn").addEventListener("click", closeFcSidebar);
  renderFcContent();
}

function renderFcContent() {
  const content = fcShadow.querySelector("#fc-content");

  if (fcState.status === "idle") {
    content.innerHTML = `
      <div class="fc-idle">
        <p>Fact-check the claims made in this video.</p>
        <p class="fc-note">Note: only YouTube is supported currently.</p>
        <button id="fc-run-btn">Fact Check</button>
      </div>`;
    fcShadow.querySelector("#fc-run-btn").addEventListener("click", runFactCheck);
    return;
  }

  if (fcState.status === "loading") {
    content.innerHTML = `
      <div class="fc-loading">
        <div class="fc-spinner"></div>
        <p>Fetching transcript and analysing claims…</p>
      </div>`;
    return;
  }

  if (fcState.status === "error") {
    content.innerHTML = `<div class="fc-error"><p>${escapeHtml(fcState.error)}</p></div>`;
    return;
  }

  const cards = fcState.claims.map((c) => {
    const v = VERDICT_CONFIG[c.verdict] ?? VERDICT_CONFIG.Uncertain;
    return `
      <div class="fc-card">
        <div class="fc-card-top">
          <span class="fc-badge" style="color:${v.color};background:${v.bg}">${v.label}</span>
          <p class="fc-claim">${escapeHtml(c.claim)}</p>
        </div>
        <p class="fc-explanation">${escapeHtml(c.explanation)}</p>
      </div>`;
  }).join("");

  const total = fcState.claims.length;
  const counts = Object.fromEntries(
    Object.keys(VERDICT_CONFIG).map((k) => [k, fcState.claims.filter((c) => c.verdict === k).length])
  );

  content.innerHTML = `
    <div class="fc-summary">
      ${total} claims &nbsp;·&nbsp;
      <span style="color:#065f46">${counts.True} true</span> &nbsp;·&nbsp;
      <span style="color:#991b1b">${counts.False} false</span> &nbsp;·&nbsp;
      <span style="color:#92400e">${counts.Uncertain} uncertain</span> &nbsp;·&nbsp;
      <span style="color:#1e3a5f">${counts.Opinion} opinion</span>
    </div>
    <div class="fc-cards">${cards}</div>`;
}

async function runFactCheck() {
  fcState = { status: "loading", claims: null, error: null };
  renderFcContent();

  const response = await chrome.runtime.sendMessage({
    type: "FACTCHECK",
    url: window.location.href,
  });

  if (response.error) {
    fcState = { status: "error", claims: null, error: response.error };
  } else {
    fcState = { status: "done", claims: response.claims, error: null };
  }
  renderFcContent();
}

function openFcSidebar() {
  if (!fcShadow) buildFcSidebar();
  fcShadow.querySelector("#fc-sidebar").classList.add("open");
  document.body.style.marginRight = "400px";
}

function closeFcSidebar() {
  fcShadow.querySelector("#fc-sidebar").classList.remove("open");
  document.body.style.marginRight = "";
}

function buildFcTriggerButton() {
  if (document.getElementById("bbgone-fc-trigger")) return;
  const btn = document.createElement("button");
  btn.id = "bbgone-fc-trigger";
  btn.textContent = "🎥 Fact Check";
  btn.addEventListener("click", openFcSidebar);
  document.body.appendChild(btn);
}

function getFcSidebarStyles() {
  return `
    #fc-sidebar {
      position: fixed; top: 0; right: -400px; width: 380px; height: 100vh;
      background: #fff; box-shadow: -4px 0 24px rgba(0,0,0,0.12);
      display: flex; flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px; color: #1a1a1a; transition: right 0.3s ease;
      z-index: 2147483647; box-sizing: border-box;
    }
    #fc-sidebar.open { right: 0; }
    #fc-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px; background: #1a1a2e; color: #fff; flex-shrink: 0;
    }
    #fc-title { font-weight: 600; font-size: 15px; }
    #fc-close-btn { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; padding: 0 4px; line-height: 1; }
    #fc-content { flex: 1; overflow-y: auto; padding: 16px; }
    .fc-idle { text-align: center; padding: 32px 16px; }
    .fc-idle p { color: #6b7280; margin-bottom: 8px; }
    .fc-note { font-size: 12px !important; }
    #fc-run-btn {
      margin-top: 8px; background: #1a1a2e; color: #fff; border: none;
      padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;
    }
    #fc-run-btn:hover { background: #2d2d4e; }
    .fc-loading {
      display: flex; flex-direction: column; align-items: center;
      padding: 48px 16px; color: #6b7280; text-align: center; line-height: 1.5;
    }
    .fc-spinner {
      width: 28px; height: 28px; border: 3px solid #e5e7eb;
      border-top-color: #1a1a2e; border-radius: 50%;
      animation: fc-spin 0.7s linear infinite; margin-bottom: 12px;
    }
    @keyframes fc-spin { to { transform: rotate(360deg); } }
    .fc-error { padding: 16px; background: #fef2f2; border-radius: 8px; color: #b91c1c; }
    .fc-summary {
      font-size: 12px; color: #6b7280; margin-bottom: 12px;
      padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;
    }
    .fc-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 10px; }
    .fc-card-top { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
    .fc-badge { flex-shrink: 0; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; }
    .fc-claim { font-weight: 500; line-height: 1.4; margin: 0; }
    .fc-explanation { font-size: 13px; color: #6b7280; line-height: 1.5; margin: 0; }
  `;
}

// ----- Init -----

if (isVideoPage()) buildFcTriggerButton();

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "OPEN_FC_SIDEBAR") {
    buildFcTriggerButton();
    openFcSidebar();
  }
});
