"use client";
import { useState, useRef, useEffect } from "react";

// ── Mock conversation starters ─────────────────────────────
const STARTERS = [
  "I've been feeling anxious lately and don't know why...",
  "I want to talk about something that happened today.",
  "How can I manage stress during exam season?",
  "I'm struggling to sleep and my mind won't stop.",
];

// ── Mock AI responses ──────────────────────────────────────
const AI_RESPONSES = [
  "Thank you for sharing that with me. It takes courage to open up. Can you tell me a bit more about when you first started noticing this feeling? Sometimes understanding the context helps us find a path forward together. 💙",
  "I hear you, and I want you to know that what you're feeling is completely valid. Anxiety can be overwhelming, but you're not alone in this. Let's explore this together — what does it feel like in your body when anxiety comes up?",
  "That sounds really difficult, and I'm glad you reached out. Sometimes just putting our feelings into words can bring a little relief. Would you like to talk through what's been on your mind, or would some calming techniques be helpful right now?",
  "I'm here with you. There's no rush — share as much or as little as you're comfortable with. Whatever you're feeling is welcome here. 🌿",
];

function TypingDots() {
  return (
    <div className="flex items-end gap-2.5 mb-2 animate-fade-in">
      <div className="w-8 h-8 rounded-2xl bg-sage-100 flex items-center justify-center text-sm flex-shrink-0">
        🌿
      </div>
      <div className="bg-white border border-stone-100 rounded-3xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="typing-dot w-2 h-2 rounded-full bg-sage-300 inline-block"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-end gap-2.5 mb-2 animate-fade-in ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`w-8 h-8 rounded-2xl flex items-center justify-center text-sm flex-shrink-0 mb-0.5 ${isUser ? "bg-lavender-100" : "bg-sage-100"}`}>
        {isUser ? "😊" : "🌿"}
      </div>
      <div className={`max-w-[75%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 rounded-3xl text-sm leading-relaxed shadow-sm ${isUser ? "bg-sage-500 text-white rounded-br-sm" : "bg-white text-stone-700 border border-stone-100 rounded-bl-sm"}`}>
          {message.content.split("\n").map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </div>
        <span className="text-xs text-stone-300 px-1">{message.time}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi there 👋 I'm TheraFlow — your calm, private companion. How are you feeling today? You can share as much or as little as you'd like. I'm here to listen.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput]     = useState("");
  const [typing, setTyping]   = useState(false);
  const bottomRef             = useRef(null);
  const textareaRef           = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  async function send() {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    textareaRef.current.style.height = "auto";

    const userMsg = { role: "user", content: text, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    // Simulate AI thinking delay
    const delay = 1200 + Math.random() * 1000;
    await new Promise((r) => setTimeout(r, delay));

    const reply = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
    setTyping(false);
    setMessages((prev) => [...prev, { role: "assistant", content: reply, time: now() }]);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function autoResize(e) {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 bg-white/60 backdrop-blur-sm flex-shrink-0">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sage-100 to-lavender-100 flex items-center justify-center text-lg shadow-sm">
          🌿
        </div>
        <div>
          <div className="font-semibold text-stone-800 text-sm">TheraFlow AI</div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sage-400 animate-pulse-soft" />
            <span className="text-xs text-stone-400">Always here for you</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto">
          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} />
          ))}
          {typing && <TypingDots />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick starters (only when no user message sent yet) */}
      {messages.length === 1 && (
        <div className="px-6 pb-2">
          <div className="max-w-2xl mx-auto flex flex-wrap gap-2">
            {STARTERS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                className="text-xs px-3 py-2 rounded-2xl border border-stone-200 bg-white hover:bg-sage-50 hover:border-sage-200 text-stone-500 hover:text-sage-700 transition-all"
              >
                {s.length > 45 ? s.slice(0, 45) + "…" : s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input box */}
      <div className="px-6 py-4 border-t border-stone-100 bg-white/60 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-3 glass rounded-3xl px-4 py-3 shadow-soft border border-stone-200/50">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(e); }}
              onKeyDown={handleKey}
              placeholder="Share what's on your mind…"
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-stone-700 placeholder-stone-400 outline-none leading-relaxed max-h-40"
            />
            <button
              onClick={send}
              disabled={!input.trim() || typing}
              id="chat-send-btn"
              className="w-9 h-9 rounded-2xl bg-sage-500 hover:bg-sage-600 disabled:bg-stone-200 flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-stone-300 mt-2">
            TheraFlow is an AI companion — not a licensed therapist. Crisis support: call or text 988.
          </p>
        </div>
      </div>
    </div>
  );
}
