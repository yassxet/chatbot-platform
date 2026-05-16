import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return NextResponse.json({ error: "botId is required" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";

  const embedCode = `<script src="${baseUrl}/embed.js" data-bot-id="${botId}"></script>`;

  return NextResponse.json({ embedCode, botId });
}
