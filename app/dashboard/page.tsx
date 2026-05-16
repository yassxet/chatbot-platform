"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { Bot, Plus, Trash2, ExternalLink, Code, Loader2 } from "lucide-react";

interface BotItem {
  id: string;
  name: string;
  primary_color: string;
  welcome_message: string;
  created_at: string;
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [bots, setBots] = useState<BotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) fetchBots();
  }, [isSignedIn]);

  const fetchBots = async () => {
    try {
      const res = await fetch("/api/bots");
      const data = await res.json();
      setBots(Array.isArray(data) ? data : []);
    } catch {
      setBots([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteBot = async (id: string) => {
    if (!confirm("Delete this bot and all its documents?")) return;
    setDeletingId(id);
    await fetch(`/api/bots/${id}`, { method: "DELETE" });
    setBots((prev) => prev.filter((b) => b.id !== id));
    setDeletingId(null);
  };

  const copyEmbed = async (id: string) => {
    const code = `<script src="${window.location.origin}/embed.js" data-bot-id="${id}"></script>`;
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-indigo-600">
          <Bot size={20} /> BotForge
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/demo"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Live Demo
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Chatbots</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create and manage your AI chatbots
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} /> New Bot
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-400" size={32} />
          </div>
        ) : bots.length === 0 ? (
          <div className="text-center py-20">
            <Bot className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">No chatbots yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Create your first bot to get started
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
            >
              <Plus size={14} /> Create Bot
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: bot.primary_color }}
                    >
                      <Bot size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{bot.name}</h3>
                      <p className="text-xs text-gray-400">
                        {new Date(bot.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteBot(bot.id)}
                    disabled={deletingId === bot.id}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {deletingId === bot.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 italic mb-4 line-clamp-1">
                  "{bot.welcome_message}"
                </p>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/${bot.id}`}
                    className="flex-1 text-center text-xs border border-gray-200 rounded-lg py-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/chat/${bot.id}`}
                    target="_blank"
                    className="flex items-center justify-center gap-1 flex-1 text-xs border border-gray-200 rounded-lg py-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink size={11} /> Preview
                  </Link>
                  <button
                    onClick={() => copyEmbed(bot.id)}
                    className="flex items-center justify-center gap-1 flex-1 text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg py-1.5 hover:bg-indigo-100 transition-colors font-medium"
                  >
                    <Code size={11} />
                    {copiedId === bot.id ? "Copied!" : "Embed"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
