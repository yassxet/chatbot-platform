"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Code } from "lucide-react";
import { BotCustomizer, BotFormData } from "@/components/BotCustomizer";
import { FileUploader } from "@/components/FileUploader";
import { ChatWidget } from "@/components/ChatWidget";

export default function EditBotPage() {
  const router = useRouter();
  const params = useParams();
  const botId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<BotFormData>({
    name: "",
    primary_color: "#6366f1",
    welcome_message: "Hi! How can I help you today?",
    logo_url: "",
  });

  useEffect(() => {
    fetch(`/api/bots/${botId}`)
      .then((r) => r.json())
      .then((bot) => {
        setFormData({
          name: bot.name,
          primary_color: bot.primary_color,
          welcome_message: bot.welcome_message,
          logo_url: bot.logo_url || "",
        });
      })
      .finally(() => setLoading(false));
  }, [botId]);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/bots/${botId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setSaving(false);
  };

  const copyEmbed = async () => {
    const code = `<script src="${window.location.origin}/embed.js" data-bot-id="${botId}"></script>`;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-400" size={32} />
      </div>
    );
  }

  const previewConfig = {
    id: botId,
    name: formData.name || "My Bot",
    primary_color: formData.primary_color,
    welcome_message: formData.welcome_message,
    logo_url: formData.logo_url || null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-700">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-semibold text-gray-900">Edit Bot</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyEmbed}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <Code size={14} />
            {copied ? "Copied!" : "Copy Embed Code"}
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save Changes
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-5">Bot Settings</h2>
            <BotCustomizer value={formData} onChange={setFormData} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-2">Add Documents</h2>
            <p className="text-sm text-gray-500 mb-4">
              Upload additional documents to expand what your bot knows.
            </p>
            <FileUploader botId={botId} />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Live Preview
          </h2>
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-96 flex items-end justify-end p-6 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <p className="text-xs">Preview</p>
            </div>
            <ChatWidget config={previewConfig} demoMode={true} />
          </div>
        </div>
      </main>
    </div>
  );
}
