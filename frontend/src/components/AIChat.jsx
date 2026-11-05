import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X, Sparkles, RefreshCw } from "lucide-react";
import api from "../api/axios.js";
import Markdown from "./Markdown.jsx";

const SAMPLES = [
  "Which day of the week am I most consistent?",
  "What is my best performing category?",
  "Why do I keep failing my exercise habit?",
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi — ask me anything about your habit data. Try one of the examples below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, open]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await api.post("/ai/chat", { question: q });
      setMessages((m) => [
        ...m,
        { role: "assistant", content: res.data.content },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Sorry, I couldn't answer that right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 md:bottom-6 right-6 z-40 w-12 h-12 border border-zinc-700 rounded-sm bg-[#171a1b] text-zinc-200 flex items-center justify-center hover:bg-[#222627] transition"
        aria-label="AI Chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-36 md:bottom-24 right-6 z-40 w-[min(92vw,440px)] h-[min(72vh,580px)] bg-[#111415] border border-zinc-800 flex flex-col animate-slide-up overflow-hidden">
          <div className="px-4 py-3 border-b divider flex items-center gap-2">
            <div className="w-7 h-7 border border-zinc-700 text-zinc-200 rounded-sm flex items-center justify-center">
              <Sparkles size={14} />
            </div>
            <div>
              <div className="text-sm font-medium">Habit Analysis</div>
              <div className="text-xs text-muted">AI-powered insights</div>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="chat-stream flex-1 overflow-y-auto px-5 py-5"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-entry ${m.role === "user" ? "chat-user" : "chat-assistant"}`}
              >
                <div
                  className={`chat-copy max-w-full text-sm leading-[1.8] ${m.role === "user" ? "chat-copy-user" : "chat-copy-assistant"}`}
                >
                  {m.role === "user" ? m.content : <Markdown>{m.content}</Markdown>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="text-sm text-muted flex items-center gap-2 py-3 border-t border-zinc-800/70">
                  <RefreshCw size={12} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            {messages.length === 1 && (
              <div className="pt-2 space-y-1.5">
                {SAMPLES.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="block w-full text-left text-xs border-t border-zinc-800/70 hover:text-zinc-100 px-1 py-3 text-zinc-400"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="p-4 border-t border-zinc-800/80 flex gap-2"
          >
            <input
              className="input"
              placeholder="Ask about your habits..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="btn-primary px-3"
              disabled={loading}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
