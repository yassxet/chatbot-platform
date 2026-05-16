import { anthropic, MODEL } from "./anthropic";
import { embedText } from "./embeddings";
import { similaritySearch, StoredChunk } from "./vectorstore";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface RagResult {
  reply: string;
  sources: Array<{ filename: string; page?: number }>;
}

export async function ragChat(
  userMessage: string,
  botId: string,
  conversationHistory: Message[],
  botName = "AI Assistant"
): Promise<RagResult> {
  // 1. Embed the user query
  const queryEmbedding = await embedText(userMessage);

  // 2. Retrieve top-K relevant chunks from vector store
  const relevantChunks = await similaritySearch(queryEmbedding, botId, 5);

  const sources = relevantChunks
    .map((c) => ({ filename: c.metadata.filename, page: c.metadata.page }))
    .filter(
      (s, i, arr) => arr.findIndex((x) => x.filename === s.filename) === i
    );

  // 3. Build system prompt
  let systemPrompt: string;

  if (relevantChunks.length > 0) {
    const context = relevantChunks
      .map(
        (c) =>
          `[Source: ${c.metadata.filename}${c.metadata.page ? `, Page ${c.metadata.page}` : ""}]\n${c.pageContent}`
      )
      .join("\n\n---\n\n");

    systemPrompt = `You are ${botName}, a helpful AI assistant. Answer questions based ONLY on the following company information.
If the answer is not in the provided information, say "I don't have that information, but you can contact us directly for more help."
Be concise, friendly, and professional. When possible, mention which document your answer comes from.

COMPANY INFORMATION:
${context}`;
  } else {
    // Graceful fallback when no documents match
    systemPrompt = `You are ${botName}, a helpful AI assistant. The knowledge base doesn't contain specific information about this question.
Politely let the user know you don't have that information in your knowledge base and suggest they contact the company directly.`;
  }

  // 4. Call Claude with conversation history
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      ...conversationHistory,
      { role: "user", content: userMessage },
    ],
  });

  const reply =
    response.content[0].type === "text" ? response.content[0].text : "";

  return { reply, sources };
}

export async function ragChatStream(
  userMessage: string,
  botId: string,
  conversationHistory: Message[],
  botName = "AI Assistant"
) {
  const queryEmbedding = await embedText(userMessage);
  const relevantChunks = await similaritySearch(queryEmbedding, botId, 5);

  const sources = relevantChunks
    .map((c) => ({ filename: c.metadata.filename, page: c.metadata.page }))
    .filter(
      (s, i, arr) => arr.findIndex((x) => x.filename === s.filename) === i
    );

  let systemPrompt: string;

  if (relevantChunks.length > 0) {
    const context = relevantChunks
      .map(
        (c) =>
          `[Source: ${c.metadata.filename}${c.metadata.page ? `, Page ${c.metadata.page}` : ""}]\n${c.pageContent}`
      )
      .join("\n\n---\n\n");

    systemPrompt = `You are ${botName}, a helpful AI assistant. Answer questions based ONLY on the following company information.
If the answer is not in the provided information, say "I don't have that information, but you can contact us directly for more help."
Be concise, friendly, and professional. When possible, mention which document your answer comes from.

COMPANY INFORMATION:
${context}`;
  } else {
    systemPrompt = `You are ${botName}, a helpful AI assistant. The knowledge base doesn't contain specific information about this question.
Politely let the user know you don't have that information in your knowledge base and suggest they contact the company directly.`;
  }

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      ...conversationHistory,
      { role: "user", content: userMessage },
    ],
  });

  return { stream, sources };
}
