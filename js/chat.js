let currentController = null;
let typingInterval    = null;

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

// Toggle input area between idle and loading states
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

// Abort fetch + stop typing animation
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

// Typing animation — calls setInputState("idle") when done
function typeText(element, text) {
  if (typingInterval) clearInterval(typingInterval);
  let index = 0;
  typingInterval = setInterval(() => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(typingInterval);
      typingInterval = null;
      setInputState("idle");
    }
  }, 18);
}

async function sendMessage() {
  const input    = document.getElementById("chatInput");
  const text     = input.value.trim();
  const messages = document.getElementById("chatMessages");

  if (!text) return;

  // User message bubble
  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = text;
  messages.appendChild(userMsg);
  messages.scrollTop = messages.scrollHeight;
  input.value = "";

  // Bot placeholder
  const botMsg = document.createElement("div");
  botMsg.className = "message assistant";
  botMsg.textContent = "Typing...";
  messages.appendChild(botMsg);
  messages.scrollTop = messages.scrollHeight;

  setInputState("loading");

  if (currentController) currentController.abort();
  currentController = new AbortController();

  try {
    const res = await fetch("http://localhost:5551/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
      signal: currentController.signal,
    });

    const data = await res.json();
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
