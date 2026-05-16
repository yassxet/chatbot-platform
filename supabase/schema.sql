-- Run this in your Supabase SQL editor

-- Chatbot configurations
CREATE TABLE IF NOT EXISTS bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  welcome_message TEXT DEFAULT 'Hi! How can I help you today?',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation logs
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document metadata (vector chunks stored in Chroma separately)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  chunk_count INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Bots: users can only see/manage their own bots
CREATE POLICY "Users manage own bots" ON bots
  FOR ALL USING (user_id = auth.uid()::text);

-- Public read for bot config (needed for chat widget)
CREATE POLICY "Public read bot config" ON bots
  FOR SELECT USING (true);

-- Conversations: only bot owners can read logs
CREATE POLICY "Bot owners read conversations" ON conversations
  FOR SELECT USING (
    bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()::text)
  );

-- Service role can insert conversations (from API routes)
CREATE POLICY "Service role insert conversations" ON conversations
  FOR INSERT WITH CHECK (true);

-- Documents: only bot owners can manage
CREATE POLICY "Bot owners manage documents" ON documents
  FOR ALL USING (
    bot_id IN (SELECT id FROM bots WHERE user_id = auth.uid()::text)
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bots_user_id ON bots(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_bot_id ON conversations(bot_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_documents_bot_id ON documents(bot_id);
