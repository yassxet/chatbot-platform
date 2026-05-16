import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { deleteChunksByBotId } from "@/lib/vectorstore";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from("bots")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET bot error:", error);
    return NextResponse.json({ error: "Failed to fetch bot" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, logo_url, primary_color, welcome_message } = body;

    const { data, error } = await supabase
      .from("bots")
      .update({ name, logo_url, primary_color, welcome_message })
      .eq("id", params.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("PATCH bot error:", error);
    return NextResponse.json({ error: "Failed to update bot" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete vector embeddings first
    await deleteChunksByBotId(params.id);

    const { error } = await supabase
      .from("bots")
      .delete()
      .eq("id", params.id)
      .eq("user_id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE bot error:", error);
    return NextResponse.json({ error: "Failed to delete bot" }, { status: 500 });
  }
}
