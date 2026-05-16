import { ChromaClient, Collection } from "chromadb";
import { embedText, embedTexts } from "./embeddings";
import { Document } from "langchain/document";

const chroma = new ChromaClient({
  path: process.env.CHROMA_URL || "http://localhost:8000",
});

const COLLECTION_NAME = "chatbot_documents";

async function getCollection(): Promise<Collection> {
  return chroma.getOrCreateCollection({
    name: COLLECTION_NAME,
    metadata: { "hnsw:space": "cosine" },
  });
}

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
  const collection = await getCollection();

  const texts = docs.map((d) => d.pageContent);
  const embeddings = await embedTexts(texts);
  const ids = docs.map(
    (d, i) => `${d.metadata.botId}_${d.metadata.filename}_${d.metadata.chunkIndex ?? i}`
  );
  const metadatas = docs.map((d) => d.metadata);

  await collection.add({
    ids,
    embeddings,
    documents: texts,
    metadatas,
  });
}

export async function similaritySearch(
  queryEmbedding: number[],
  botId: string,
  topK = 5
): Promise<StoredChunk[]> {
  const collection = await getCollection();

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
    where: { botId },
  });

  if (!results.documents[0]) return [];

  return results.documents[0].map((doc, i) => ({
    id: results.ids[0][i],
    pageContent: doc ?? "",
    metadata: (results.metadatas[0][i] ?? {}) as StoredChunk["metadata"],
  }));
}

export async function deleteChunksByBotId(botId: string): Promise<void> {
  const collection = await getCollection();
  const existing = await collection.get({ where: { botId } });
  if (existing.ids.length > 0) {
    await collection.delete({ ids: existing.ids });
  }
}
