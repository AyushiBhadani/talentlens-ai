"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { assistantApi } from "@/lib/api";
import { Brain, Send, Sparkles, User, MessageSquare, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "14px 16px", alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1" }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm **LENS**, your AI Hiring Copilot.\n\nI can help you:\n- Rank and compare candidates\n- Generate interview questions\n- Write professional hiring emails\n- Analyze job requirements\n- Summarize candidate profiles\n\nWhat would you like to do today?",
      id: "welcome",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: suggestionsData } = useQuery({
    queryKey: ["suggestions"],
    queryFn: assistantApi.suggestions,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function sendMessage(text: string) {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { role: "user", content: text, id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const data = await assistantApi.chat(text, history);
      const assistantMsg: Message = {
        role: "assistant",
        content: data.response,
        id: Date.now().toString() + "-resp",
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚠️ I'm having trouble connecting to the AI backend. Please check your Gemini API key in the backend `.env` file.",
        id: Date.now().toString() + "-err",
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div style={{ height: "calc(100vh - 108px)", display: "flex", flexDirection: "column", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
          <Brain size={22} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>LENS AI Assistant</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Your intelligent hiring copilot · Powered by Gemini 2.0 Flash</p>
        </div>
        <button
          onClick={() => setMessages([{ role: "assistant", content: "👋 Fresh start! How can I help you today?", id: Date.now().toString() }])}
          className="btn btn-ghost"
          style={{ marginLeft: "auto", fontSize: 12 }}
          title="Clear conversation"
        >
          <RefreshCw size={14} /> Clear
        </button>
      </div>

      {/* Chat Window */}
      <div className="card" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Messages */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 20px 0" }}>
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", gap: 10, marginBottom: 16, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
              >
                {msg.role === "assistant" && (
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <Brain size={15} color="white" />
                  </div>
                )}

                <div
                  className={msg.role === "user" ? "chat-message-user" : "chat-message-assistant"}
                  style={{ fontSize: 14, lineHeight: 1.7 }}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose" style={{ color: "inherit" }}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                  )}
                </div>

                {msg.role === "user" && (
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <User size={15} color="var(--text-muted)" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", gap: 10, marginBottom: 16 }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Brain size={15} color="white" />
              </div>
              <div className="chat-message-assistant">
                <TypingIndicator />
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && suggestionsData?.suggestions && (
          <div style={{ padding: "12px 20px", display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid var(--border)" }}>
            {suggestionsData.suggestions.map((s: string) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: "6px 12px", borderRadius: 999 }}
              >
                {s.slice(0, 40)}{s.length > 40 ? "..." : ""}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div style={{ padding: 16, borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            className="input"
            style={{ flex: 1, minHeight: 44, maxHeight: 120, resize: "none", padding: "10px 14px", fontSize: 14, lineHeight: 1.5 }}
            placeholder="Ask LENS anything about your candidates or jobs... (Enter to send, Shift+Enter for newline)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            id="lens-chat-input"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="btn btn-primary"
            style={{ padding: "10px 16px", flexShrink: 0, alignSelf: "flex-end" }}
            id="lens-send-btn"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
