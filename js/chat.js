function showChatBox() {
  document.getElementById("chatOpenButton").style.display = "none";
  const container = document.getElementById("chatContainer");
  const chatWindow = document.getElementById("chatWindow");
  container.classList.add("open");
  chatWindow.classList.remove("minimized"); // restore if was minimized before closing
}

function hideChatBox() {
  document.getElementById("chatOpenButton").style.display = "flex";
  document.getElementById("chatContainer").classList.remove("open");
}

function minimizeChat() {
  document.getElementById("chatWindow").classList.toggle("minimized");
}

// ✨ Typing animation
function typeText(element, text) {
  let index = 0;
  const interval = setInterval(() => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

async function sendMessage() {
  const input    = document.getElementById("chatInput");
  const text     = input.value.trim();
  const messages = document.getElementById("chatMessages");

  if (!text) return;

  // User message
  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = text;
  messages.appendChild(userMsg);
  messages.scrollTop = messages.scrollHeight;
  input.value = "";

  // Typing indicator
  const botMsg = document.createElement("div");
  botMsg.className = "message assistant";
  botMsg.textContent = "Typing...";
  messages.appendChild(botMsg);
  messages.scrollTop = messages.scrollHeight;

  try {
    const res = await fetch("http://localhost:5551/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    botMsg.textContent = "";
    typeText(botMsg, data.reply.trim());
  } catch (error) {
    botMsg.textContent = "Could not reach the server. Is it running?";
  }

  messages.scrollTop = messages.scrollHeight;
}
