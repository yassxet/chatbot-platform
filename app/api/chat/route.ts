import { NextRequest, NextResponse } from "next/server";
import { ragChatStream } from "@/lib/rag";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { botId, message, history = [], sessionId } = body;

    if (!botId || !message) {
      return NextResponse.json(
        { error: "botId and message are required" },
        { status: 400 }
      );
    }

    const { data: bot } = await supabase
      .from("bots")
      .select("name, welcome_message")
      .eq("id", botId)
      .single();

    const { stream, sources } = await ragChatStream(
      message,
      botId,
      history,
      bot?.name ?? "AI Assistant"
    );

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullReply = "";

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = event.delta.text;
            fullReply += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`)
            );
          }
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ sources, done: true })}\n\n`
          )
        );

        if (sessionId) {
          await supabase.from("conversations").insert([
            {
              bot_id: botId,
              session_id: sessionId,
              role: "user",
              content: message,
            },
            {
              bot_id: botId,
              session_id: sessionId,
              role: "assistant",
              content: fullReply,
            },
          ]);
        }

        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
