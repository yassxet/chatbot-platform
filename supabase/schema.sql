-- Run this in your Supabase SQL editor
-- ============================================================
-- STEP 1: Enable pgvector extension (do this first)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- STEP 2: Document embeddings table (replaces Chroma DB)
-- Each row = one text chunk + its 1536-dim OpenAI embedding
-- ============================================================
CREATE TABLE IF NOT EXISTS document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  filename TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  page INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast vector similarity search (cosine distance)
CREATE INDEX IF NOT EXISTS idx_doc_embeddings_vector
  ON document_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for filtering by bot
CREATE INDEX IF NOT EXISTS idx_doc_embeddings_bot_id
  ON document_embeddings(bot_id);

-- ============================================================
-- STEP 3: Similarity search function
-- Returns the top-K most relevant chunks for a given bot
-- ============================================================
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_bot_id UUID,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  filename TEXT,
  chunk_index INTEGER,
  page INTEGER,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.content,
    de.filename,
    de.chunk_index,
    de.page,
    1 - (de.embedding <=> query_embedding) AS similarity
  FROM document_embeddings de
  WHERE de.bot_id = match_bot_id
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
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
