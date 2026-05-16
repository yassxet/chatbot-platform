import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface Bot {
  id: string;
  user_id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  welcome_message: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  bot_id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface BotDocument {
  id: string;
  bot_id: string;
  filename: string;
  chunk_count: number;
  uploaded_at: string;
}
