import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    new URL(url); // validate URL
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // For demo purposes, return the screenshot API URL
  // Many sites block iframe embedding via X-Frame-Options
  const screenshotApiKey = process.env.SCREENSHOT_API_KEY;
  if (screenshotApiKey) {
    const screenshotUrl = `https://api.screenshotone.com/take?access_key=${screenshotApiKey}&url=${encodeURIComponent(url)}&viewport_width=1280&viewport_height=800&format=jpg`;
    return NextResponse.json({ screenshotUrl, iframeBlocked: true });
  }

  return NextResponse.json({
    iframeUrl: url,
    iframeBlocked: false,
  });
}
