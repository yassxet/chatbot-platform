import { NextRequest, NextResponse } from "next/server";
import { ingestDocument, validateFile } from "@/lib/ingest";
import { supabase } from "@/lib/supabase";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const botId = formData.get("botId") as string | null;

    if (!file || !botId) {
      return NextResponse.json(
        { error: "file and botId are required" },
        { status: 400 }
      );
    }

    const validation = validateFile(file.type, file.size);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Write to temp file
    const tempDir = os.tmpdir();
    const tempPath = path.join(tempDir, `upload_${Date.now()}_${file.name}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(tempPath, buffer);

    const chunkCount = await ingestDocument(
      tempPath,
      botId,
      file.type,
      file.name
    );

    // Record document in Supabase
    await supabase.from("documents").insert({
      bot_id: botId,
      filename: file.name,
      chunk_count: chunkCount,
    });

    return NextResponse.json({ success: true, chunksIndexed: chunkCount });
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json(
      { error: "Failed to ingest document" },
      { status: 500 }
    );
  }
}
