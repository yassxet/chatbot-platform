"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bot, Loader2 } from "lucide-react";
import { BotCustomizer, BotFormData } from "@/components/BotCustomizer";
import { FileUploader } from "@/components/FileUploader";
import { ChatWidget } from "@/components/ChatWidget";

export default function NewBotPage() {
  const router = useRouter();
  const [step, setStep] = useState<"configure" | "upload">("configure");
  const [createdBotId, setCreatedBotId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<BotFormData>({
    name: "",
    primary_color: "#6366f1",
    welcome_message: "Hi! How can I help you today?",
    logo_url: "",
  });

  const createBot = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a bot name");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const bot = await res.json();
      setCreatedBotId(bot.id);
      setStep("upload");
    } catch {
      alert("Failed to create bot");
    } finally {
      setCreating(false);
    }
  };

  const previewConfig = {
    id: createdBotId || "preview",
    name: formData.name || "My Bot",
    primary_color: formData.primary_color,
    welcome_message: formData.welcome_message,
    logo_url: formData.logo_url || null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-semibold text-gray-900">Create New Bot</h1>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
        {/* Left: Configuration */}
        <div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {step === "configure" ? (
              <>
                <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <Bot size={18} className="text-indigo-500" />
                  Configure Your Bot
                </h2>
                <BotCustomizer value={formData} onChange={setFormData} />
                <button
                  onClick={createBot}
                  disabled={creating}
                  className="mt-6 w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {creating && <Loader2 size={16} className="animate-spin" />}
                  {creating ? "Creating..." : "Create Bot & Upload Docs →"}
                </button>
              </>
            ) : (
              <>
                <h2 className="font-semibold text-gray-900 mb-2">
                  Upload Documents
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  Upload the files your bot should learn from. You can add more
                  later.
                </p>
                <FileUploader
                  botId={createdBotId!}
                  onSuccess={(name, chunks) => {
                    console.log(`Indexed ${name}: ${chunks} chunks`);
                  }}
                />
                <button
                  onClick={() => router.push("/dashboard")}
                  className="mt-6 w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  Finish → Go to Dashboard
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Live Preview
          </h2>
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-96 flex items-end justify-end p-6 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Bot size={48} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs">Your website content goes here</p>
              </div>
            </div>
            <ChatWidget config={previewConfig} demoMode={true} />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            The widget will float over your website like this
          </p>
        </div>
      </main>
    </div>
  );
}
