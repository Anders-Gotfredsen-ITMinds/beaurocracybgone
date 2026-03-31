(async () => {
  const { apiKey = "", apiUrl = "http://localhost:8000" } =
    await chrome.storage.sync.get(["apiKey", "apiUrl"]);
  document.getElementById("api-key").value = apiKey;
  document.getElementById("api-url").value = apiUrl;
})();

document.getElementById("settings-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const apiKey = document.getElementById("api-key").value.trim();
  const apiUrl = document.getElementById("api-url").value.trim();
  await chrome.storage.sync.set({ apiKey, apiUrl });

  const feedback = document.getElementById("feedback");
  feedback.textContent = "Saved.";
  feedback.className = "success";
  setTimeout(() => (feedback.textContent = ""), 2000);
});
