chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "ANALYZE") {
    handleAnalyze(message.text, message.mode).then(sendResponse);
    return true; // keep channel open for async response
  }
  if (message.type === "FACTCHECK") {
    handleFactCheck(message.url).then(sendResponse);
    return true;
  }
});

async function handleFactCheck(url) {
  const { apiKey, apiUrl } = await chrome.storage.sync.get({
    apiKey: "",
    apiUrl: "http://localhost:8000",
  });

  if (!apiKey) {
    return { error: "No API key set. Open extension options to configure." };
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/factcheck/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { error: body.detail || `Request failed (${response.status})` };
    }

    const data = await response.json();
    return { claims: data.claims };
  } catch (err) {
    return { error: err.message };
  }
}

async function handleAnalyze(text, mode) {
  const { apiKey, apiUrl } = await chrome.storage.sync.get({
    apiKey: "",
    apiUrl: "http://localhost:8000",
  });

  if (!apiKey) {
    return { error: "No API key set. Open extension options to configure." };
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/analyze/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ text, mode }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { error: body.detail || `Request failed (${response.status})` };
    }

    const data = await response.json();
    return { result: data.result };
  } catch (err) {
    return { error: err.message };
  }
}
