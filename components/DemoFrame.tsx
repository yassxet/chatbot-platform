"use client";

import { useState } from "react";
import { ChatWidget } from "./ChatWidget";
import { BotConfig } from "./ChatWindow";
import { AlertCircle } from "lucide-react";

interface DemoFrameProps {
  url: string;
  botConfig: BotConfig;
}

export function DemoFrame({ url, botConfig }: DemoFrameProps) {
  const [iframeError, setIframeError] = useState(false);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100">
      {iframeError ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-8 text-center">
          <AlertCircle className="text-amber-400" size={40} />
          <p className="font-semibold text-gray-700">Iframe protection detected</p>
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">{url}</span> blocks
            embedding. The chatbot widget would still appear on the live page
            after you add the embed script.
          </p>
        </div>
      ) : (
        <iframe
          src={url}
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-forms"
          title="Website preview"
          onError={() => setIframeError(true)}
          onLoad={(e) => {
            try {
              // Attempt to access iframe content to detect X-Frame-Options block
              const iframe = e.currentTarget as HTMLIFrameElement;
              if (!iframe.contentDocument) setIframeError(true);
            } catch {
              setIframeError(true);
            }
          }}
        />
      )}

      {/* Overlaid chat widget */}
      <div className="absolute bottom-6 right-6 z-50">
        <ChatWidget config={botConfig} demoMode={true} />
      </div>
    </div>
  );
}
