import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { storeEmbeddings } from "./vectorstore";
import * as fs from "fs";
import * as path from "path";

export async function ingestDocument(
  filePath: string,
  botId: string,
  mimeType: string,
  filename: string
): Promise<number> {
  let loader;

  if (mimeType === "application/pdf") {
    // Dynamic import to avoid issues in edge runtime
    const { PDFLoader } = await import("langchain/document_loaders/fs/pdf");
    loader = new PDFLoader(filePath);
  } else if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filename.endsWith(".docx")
  ) {
    const { DocxLoader } = await import(
      "@langchain/community/document_loaders/fs/docx"
    );
    loader = new DocxLoader(filePath);
  } else {
    loader = new TextLoader(filePath);
  }

  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitDocuments(docs);

  chunks.forEach((chunk, i) => {
    chunk.metadata.botId = botId;
    chunk.metadata.filename = filename;
    chunk.metadata.chunkIndex = i;
  });

  await storeEmbeddings(chunks);

  // Clean up temp file
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return chunks.length;
}

export function validateFile(
  mimetype: string,
  size: number
): { valid: boolean; error?: string } {
  const ALLOWED_TYPES = [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (!ALLOWED_TYPES.includes(mimetype)) {
    return { valid: false, error: "Only PDF, TXT, and DOCX files are allowed" };
  }

  if (size > MAX_SIZE) {
    return { valid: false, error: "File size must be under 10MB" };
  }

  return { valid: true };
}
