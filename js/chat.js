let currentController  = null;
let typingInterval     = null;
let consecutiveFails   = 0;

// =============================================
// LINK RENDERING
// =============================================
function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Convert markdown links [text](url) and bare URLs to <a> tags.
// HTML is escaped first so no XSS risk from bot responses.
function linkify(raw) {
  const mdLink  = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let result    = "";
  let lastIndex = 0;
  let match;

  while ((match = mdLink.exec(raw)) !== null) {
    result += linkifyBareUrls(escapeHtml(raw.slice(lastIndex, match.index)));
    result += `<a href="${escapeHtml(match[2])}" target="_blank" rel="noopener noreferrer">${escapeHtml(match[1])}</a>`;
    lastIndex = match.index + match[0].length;
  }

  result += linkifyBareUrls(escapeHtml(raw.slice(lastIndex)));
  return result;
}

function linkifyBareUrls(escaped) {
  return escaped.replace(
    /(https?:\/\/[^\s<"&]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

// =============================================
// CHAT OPEN / CLOSE / MINIMIZE
// =============================================
function showChatBox() {
  document.getElementById("chatOpenButton").style.display = "none";
  const container  = document.getElementById("chatContainer");
  const chatWindow = document.getElementById("chatWindow");
  container.classList.add("open");
  chatWindow.classList.remove("minimized");
}

function hideChatBox() {
  document.getElementById("chatOpenButton").style.display = "flex";
  document.getElementById("chatContainer").classList.remove("open");
}

function minimizeChat() {
  document.getElementById("chatWindow").classList.toggle("minimized");
}

// =============================================
// INPUT STATE
// =============================================
function setInputState(state) {
  const sendBtn = document.getElementById("sendBtn");
  const stopBtn = document.getElementById("stopBtn");
  const input   = document.getElementById("chatInput");

  if (state === "loading") {
    sendBtn.style.display = "none";
    stopBtn.style.display = "flex";
    input.disabled = true;
  } else {
    sendBtn.style.display = "flex";
    stopBtn.style.display = "none";
    input.disabled = false;
    input.focus();
  }
}

// =============================================
// STOP
// =============================================
function stopMessage() {
  if (currentController) {
    currentController.abort();
    currentController = null;
  }
  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
  }
  setInputState("idle");
}

// =============================================
// TYPING ANIMATION
// Types plain text char-by-char, then swaps to
// linkified HTML when the animation completes.
// =============================================
function typeText(element, text) {
  if (typingInterval) clearInterval(typingInterval);
  element.textContent = "";
  let index = 0;

  typingInterval = setInterval(() => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(typingInterval);
      typingInterval = null;
      element.innerHTML = linkify(text);
      setInputState("idle");
    }
  }, 18);
}

// =============================================
// SEND MESSAGE
// =============================================
async function sendMessage() {
  const input    = document.getElementById("chatInput");
  const text     = input.value.trim();
  const messages = document.getElementById("chatMessages");

  if (!text) return;

  // User bubble
  const userMsg = document.createElement("div");
  userMsg.className   = "message user";
  userMsg.textContent = text;
  messages.appendChild(userMsg);
  messages.scrollTop = messages.scrollHeight;
  input.value = "";

  // Bot placeholder
  const botMsg = document.createElement("div");
  botMsg.className   = "message assistant";
  botMsg.textContent = "Typing...";
  messages.appendChild(botMsg);
  messages.scrollTop = messages.scrollHeight;

  setInputState("loading");

  if (currentController) currentController.abort();
  currentController = new AbortController();

  try {
    const res = await fetch("https://invigorating-acceptance-production-926c.up.railway.app/api/chat", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ message: text, failCount: consecutiveFails }),
      signal:  currentController.signal,
    });

    const data = await res.json();

    if (data.blocked) {
      consecutiveFails++;
      // After the contact prompt fires (3rd fail), reset the cycle
      if (consecutiveFails >= 3) consecutiveFails = 0;
    } else {
      consecutiveFails = 0;
    }

    botMsg.textContent = "";
    typeText(botMsg, data.reply.trim());
  } catch (error) {
    if (error.name === "AbortError") {
      botMsg.textContent = "Stopped.";
    } else {
      botMsg.textContent = "Could not reach the server. Is it running?";
    }
    setInputState("idle");
  } finally {
    currentController = null;
    messages.scrollTop = messages.scrollHeight;
  }
}
