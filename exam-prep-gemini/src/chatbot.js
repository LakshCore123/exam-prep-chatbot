/**
 * Exam Prep Chatbot — powered by FREE Google Gemini API
 * Get your free key at: https://aistudio.google.com
 */

import { GEMINI_API_KEY } from "./config.js";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;// ─── State ─────────────────────────────────────────────────────────────────────
let activeSubject = "General";
let conversationHistory = []; // { role: "user"|"model", parts: [{ text }] }

// ─── Subject chips ─────────────────────────────────────────────────────────────
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    activeSubject = chip.dataset.subject;
  });
});

// ─── Enter key ─────────────────────────────────────────────────────────────────
document.getElementById("q-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendQuestion();
});

// ─── Expose helpers for inline onclick ─────────────────────────────────────────
window.fillQ = (text) => {
  document.getElementById("q-input").value = text;
  sendQuestion();
};
window.sendQuestion = sendQuestion;

// ─── System prompt ─────────────────────────────────────────────────────────────
function buildSystemPrompt() {
  const subjectNote =
    activeSubject !== "General"
      ? ` The student is asking about ${activeSubject}.`
      : "";
  return `You are an intelligent exam preparation assistant helping students revise.${subjectNote}

Always structure EVERY answer EXACTLY like this:
1. Definition  — one clear, precise sentence.
2. Explanation — 2-4 sentences in simple language.
3. Example     — a concrete, exam-relevant example (show formulas for Maths/Science).

Rules:
- Be concise and exam-focused. No filler or preamble.
- Simple language for school/college students.
- If the question is vague, ask ONE specific follow-up question first.
- Keep total response under 200 words.
- For calculations, show step-by-step working.`;
}

// ─── Gemini API call ───────────────────────────────────────────────────────────
async function callGemini(userMessage) {
  conversationHistory.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  const body = {
    system_instruction: { parts: [{ text: buildSystemPrompt() }] },
    contents: conversationHistory,
    generationConfig: { maxOutputTokens: 600, temperature: 0.4 },
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  const reply =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Sorry, I couldn't generate a response.";

  conversationHistory.push({
    role: "model",
    parts: [{ text: reply }],
  });

  return reply;
}

// ─── Chat rendering ────────────────────────────────────────────────────────────
function scrollBottom() {
  const w = document.getElementById("chat-window");
  w.scrollTop = w.scrollHeight;
}

function addMessage(role, htmlContent) {
  const w = document.getElementById("chat-window");
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.innerHTML = `
    <div class="avatar">${role === "user" ? "You" : "AI"}</div>
    <div class="bubble">${htmlContent}</div>`;
  w.appendChild(div);
  scrollBottom();
}

function showTyping() {
  const w = document.getElementById("chat-window");
  const div = document.createElement("div");
  div.className = "msg bot";
  div.id = "typing-indicator";
  div.innerHTML = `<div class="avatar">AI</div>
    <div class="bubble"><div class="typing">
      <div class="dot"></div><div class="dot"></div><div class="dot"></div>
    </div></div>`;
  w.appendChild(div);
  scrollBottom();
}

function hideTyping() {
  document.getElementById("typing-indicator")?.remove();
}

// ─── Response formatter ────────────────────────────────────────────────────────
function formatResponse(text) {
  const lines = text.split("\n").filter((l) => l.trim());
  let html = "";
  for (const line of lines) {
    const sectionMatch = line.match(/^\d+\.\s+\*\*(.*?)\*\*[:\s—–-]*(.*)/);
    if (sectionMatch) {
      html += `<div class="section-label">${sectionMatch[1]}</div>`;
      if (sectionMatch[2].trim()) html += `<p>${inline(sectionMatch[2])}</p>`;
      continue;
    }
    const boldHeader = line.match(/^\*\*(.*?)\*\*[:\s—–-]*(.*)/);
    if (boldHeader) {
      html += `<div class="section-label">${boldHeader[1]}</div>`;
      if (boldHeader[2].trim()) html += `<p>${inline(boldHeader[2])}</p>`;
      continue;
    }
    html += `<p>${inline(line)}</p>`;
  }
  return html;
}

function inline(t) {
  return t
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>");
}

// ─── Main send handler ─────────────────────────────────────────────────────────
async function sendQuestion() {
  const input = document.getElementById("q-input");
  const btn = document.getElementById("send-btn");
  const question = input.value.trim();
  if (!question) return;

  document.getElementById("starter-suggestions")?.remove();

  input.value = "";
  btn.disabled = true;

  addMessage("user", question);
  showTyping();

  try {
    const reply = await callGemini(question);
    hideTyping();
    addMessage("bot", formatResponse(reply));
  } catch (err) {
    hideTyping();
    addMessage(
      "bot",
      `<p><strong>Error:</strong> ${err.message}.<br>
       Check your API key in <code>src/config.js</code>.<br>
       Get a free key at <a href="https://aistudio.google.com" target="_blank">aistudio.google.com</a></p>`
    );
  }

  btn.disabled = false;
  input.focus();
}
