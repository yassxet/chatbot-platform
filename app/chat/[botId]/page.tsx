import { notFound } from "next/navigation";
import { ChatWidget } from "@/components/ChatWidget";
import { supabase } from "@/lib/supabase";

interface Props {
  params: { botId: string };
}

export default async function ChatPage({ params }: Props) {
  const { data: bot } = await supabase
    .from("bots")
    .select("*")
    .eq("id", params.botId)
    .single();

  if (!bot) notFound();

  const config = {
    id: bot.id,
    name: bot.name,
    primary_color: bot.primary_color,
    welcome_message: bot.welcome_message,
    logo_url: bot.logo_url,
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100 p-4"
      style={{ fontFamily: "sans-serif" }}
    >
      <ChatWidget config={config} />
    </div>
  );
}
