"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File, X, CheckCircle, Loader2 } from "lucide-react";

interface FileUploaderProps {
  botId: string;
  onSuccess?: (filename: string, chunks: number) => void;
}

interface UploadedFile {
  name: string;
  status: "uploading" | "success" | "error";
  chunks?: number;
  error?: string;
}

export function FileUploader({ botId, onSuccess }: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const uploadFile = async (file: File) => {
    setFiles((prev) => [...prev, { name: file.name, status: "uploading" }]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("botId", botId);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setFiles((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? { name: f.name, status: "success", chunks: data.chunksIndexed }
            : f
        )
      );

      onSuccess?.(file.name, data.chunksIndexed);
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? { name: f.name, status: "error", error: (err as Error).message }
            : f
        )
      );
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach(uploadFile);
    },
    [botId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-gray-400 bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto mb-3 text-gray-400" size={36} />
        <p className="text-sm font-medium text-gray-600">
          {isDragActive
            ? "Drop files here..."
            : "Drag & drop files, or click to browse"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          PDF, TXT, DOCX — max 10MB each
        </p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.name}
              className="flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <File size={14} className="text-gray-400 shrink-0" />
                <span className="truncate text-gray-700">{f.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {f.status === "uploading" && (
                  <Loader2 size={14} className="animate-spin text-indigo-500" />
                )}
                {f.status === "success" && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={14} />
                    <span className="text-xs">{f.chunks} chunks</span>
                  </span>
                )}
                {f.status === "error" && (
                  <span className="text-xs text-red-500">{f.error}</span>
                )}
                <button
                  onClick={() => removeFile(f.name)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
