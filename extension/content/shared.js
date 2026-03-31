function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderMarkdown(text) {
  let html = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/^[-*] (.+)/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");
  html = html.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>");
  return `<p>${html}</p>`;
}
