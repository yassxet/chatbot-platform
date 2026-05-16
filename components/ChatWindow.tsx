"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Loader2 } from "lucide-react";

export interface BotConfig {
  id: string;
  name: string;
  logo_url?: string | null;
  primary_color: string;
  welcome_message: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ filename: string; page?: number }>;
}

interface ChatWindowProps {
  config: BotConfig;
  onClose: () => void;
  demoMode?: boolean;
}

export function ChatWindow({ config, onClose, demoMode = false }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: config.welcome_message },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(Math.random().toString(36).slice(2));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    const history = messages.map(({ role, content }) => ({ role, content }));

    try {
      if (demoMode) {
        // Demo mode: use Claude directly without RAG
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "This is a demo response! In the real deployment, I would search your company documents and give accurate answers based on your data.",
            },
          ]);
          setIsLoading(false);
        }, 1200);
        return;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: config.id,
          message: userMessage,
          history,
          sessionId: sessionId.current,
        }),
      });

      if (!response.ok) throw new Error("Chat request failed");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let sources: Message["sources"] = [];

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", sources: [] },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                assistantMessage += data.chunk;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantMessage,
                    sources,
                  };
                  return updated;
                });
              }
              if (data.done && data.sources) {
                sources = data.sources;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantMessage,
                    sources,
                  };
                  return updated;
                });
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="flex flex-col w-80 h-[480px] rounded-2xl shadow-2xl overflow-hidden bg-white"
      role="dialog"
      aria-label={`${config.name} Chat`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 text-white"
        style={{ backgroundColor: config.primary_color }}
      >
        <div className="flex items-center gap-2">
          {config.logo_url ? (
            <img
              src={config.logo_url}
              alt={config.name}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
          )}
          <span className="font-semibold text-sm">{config.name}</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="text-white/80 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "text-white rounded-br-sm"
                  : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
              }`}
              style={
                msg.role === "user"
                  ? { backgroundColor: config.primary_color }
                  : {}
              }
            >
              {msg.content || (
                <span className="flex gap-1 items-center text-gray-400">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-75">●</span>
                  <span className="animate-bounce delay-150">●</span>
                </span>
              )}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-1 text-xs text-gray-400">
                  Sources:{" "}
                  {msg.sources.map((s, si) => (
                    <span key={si} className="italic">
                      {s.filename}
                      {s.page ? ` (p.${s.page})` : ""}
                      {si < msg.sources!.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
              <Loader2 size={14} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            aria-label="Chat message"
            className="flex-1 resize-none text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent transition"
            style={{ "--tw-ring-color": config.primary_color } as React.CSSProperties}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-opacity disabled:opacity-40 shrink-0"
            style={{ backgroundColor: config.primary_color }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
