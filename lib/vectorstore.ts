import { supabase } from "./supabase";
import { embedText, embedTexts } from "./embeddings";
import { Document } from "langchain/document";

// Uses Supabase pgvector — no Docker or local server required.
// Requires the pgvector extension and the document_embeddings table
// (see supabase/schema.sql for setup instructions).

export interface StoredChunk {
  id: string;
  pageContent: string;
  metadata: {
    botId: string;
    filename: string;
    chunkIndex: number;
    page?: number;
  };
}

export async function storeEmbeddings(docs: Document[]): Promise<void> {
  const texts = docs.map((d) => d.pageContent);
  const embeddings = await embedTexts(texts);

  const rows = docs.map((doc, i) => ({
    bot_id: doc.metadata.botId as string,
    content: doc.pageContent,
    embedding: JSON.stringify(embeddings[i]),
    filename: doc.metadata.filename as string,
    chunk_index: (doc.metadata.chunkIndex as number) ?? i,
    page: (doc.metadata.page as number) ?? null,
  }));

  const { error } = await supabase.from("document_embeddings").insert(rows);
  if (error) throw new Error(`Failed to store embeddings: ${error.message}`);
}

export async function similaritySearch(
  queryEmbedding: number[],
  botId: string,
  topK = 5
): Promise<StoredChunk[]> {
  // Calls the match_documents Postgres function defined in schema.sql
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_bot_id: botId,
    match_count: topK,
  });

  if (error) throw new Error(`Similarity search failed: ${error.message}`);
  if (!data) return [];

  return data.map((row: {
    id: string;
    content: string;
    filename: string;
    chunk_index: number;
    page: number | null;
  }) => ({
    id: row.id,
    pageContent: row.content,
    metadata: {
      botId,
      filename: row.filename,
      chunkIndex: row.chunk_index,
      page: row.page ?? undefined,
    },
  }));
}

export async function deleteChunksByBotId(botId: string): Promise<void> {
  const { error } = await supabase
    .from("document_embeddings")
    .delete()
    .eq("bot_id", botId);

  if (error) throw new Error(`Failed to delete embeddings: ${error.message}`);
}
