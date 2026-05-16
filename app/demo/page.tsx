"use client";

import { useState } from "react";
import { Bot, Globe, Rocket, Code, Copy, Check } from "lucide-react";
import { DemoFrame } from "@/components/DemoFrame";
import { BotCustomizer, BotFormData } from "@/components/BotCustomizer";

export default function DemoPage() {
  const [url, setUrl] = useState("https://example.com");
  const [launched, setLaunched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState<BotFormData>({
    name: "Assistant",
    primary_color: "#6366f1",
    welcome_message: "Hi! How can I help you today?",
    logo_url: "",
  });

  const launch = () => {
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      setLaunched(true);
    } catch {
      alert("Please enter a valid URL");
    }
  };

  const fullUrl = url.startsWith("http") ? url : `https://${url}`;

  const embedCode = `<script src="https://yourplatform.com/embed.js" data-bot-id="YOUR_BOT_ID"></script>`;

  const copyEmbed = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const botConfig = {
    id: "demo",
    name: config.name || "Assistant",
    primary_color: config.primary_color,
    welcome_message: config.welcome_message,
    logo_url: config.logo_url || null,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 font-bold text-indigo-400 text-lg">
          <Bot size={22} />
          <span>BotForge</span>
          <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
            Live Demo Builder
          </span>
        </div>
        <a
          href="/dashboard"
          className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Get Started Free
        </a>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <aside className="w-80 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto">
          <div className="p-5 space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                <Globe size={12} className="inline mr-1" />
                Website URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setLaunched(false);
                }}
                placeholder="https://yourwebsite.com"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
              />
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Chatbot Appearance
              </p>
              <div className="[&_label]:text-gray-300 [&_input]:bg-gray-800 [&_input]:border-gray-700 [&_input]:text-white [&_textarea]:bg-gray-800 [&_textarea]:border-gray-700 [&_textarea]:text-white">
                <BotCustomizer value={config} onChange={setConfig} />
              </div>
            </div>

            <button
              onClick={launch}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Rocket size={16} />
              Launch Demo
            </button>

            {launched && (
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                  <Code size={11} /> Embed Code
                </p>
                <code className="text-xs text-indigo-300 break-all leading-relaxed block mb-3">
                  {embedCode}
                </code>
                <button
                  onClick={copyEmbed}
                  className="w-full flex items-center justify-center gap-2 text-xs bg-indigo-700 hover:bg-indigo-600 text-white py-1.5 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check size={12} />
                  ) : (
                    <Copy size={12} />
                  )}
                  {copied ? "Copied!" : "Copy Embed Code"}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Right Panel: Preview */}
        <main className="flex-1 p-6 overflow-hidden">
          {launched ? (
            <DemoFrame url={fullUrl} botConfig={botConfig} />
          ) : (
            <div className="w-full h-full rounded-xl bg-gray-900 border-2 border-dashed border-gray-700 flex flex-col items-center justify-center gap-4 text-center p-8">
              <Globe className="text-gray-600" size={48} />
              <div>
                <p className="text-gray-400 font-medium">
                  Enter a URL and click Launch Demo
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  The website will load here with your chatbot overlaid on top
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-left max-w-sm w-full">
                <p className="text-xs text-gray-500 mb-2">Quick example:</p>
                <button
                  onClick={() => {
                    setUrl("https://example.com");
                    setLaunched(true);
                  }}
                  className="text-indigo-400 text-sm hover:text-indigo-300 underline"
                >
                  Try with example.com →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
