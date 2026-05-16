"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatWindow, BotConfig } from "./ChatWindow";

interface ChatWidgetProps {
  config: BotConfig;
  demoMode?: boolean;
}

export function ChatWidget({ config, demoMode = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-end gap-3">
      {isOpen && (
        <ChatWindow
          config={config}
          onClose={() => setIsOpen(false)}
          demoMode={demoMode}
        />
      )}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: config.primary_color }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
