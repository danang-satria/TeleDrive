"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB for reliability

export default function UploadZone({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [uploads, setUploads] = useState<{ id: string; name: string; progress: number; error?: string }[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const uploadId = uuidv4();
      setUploads((prev) => [...prev, { id: uploadId, name: file.name, progress: 0 }]);
      
      try {
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        for (let i = 0; i < totalChunks; i++) {
          const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          const formData = new FormData();
          formData.append("file", chunk);
          formData.append("fileName", file.name);
          formData.append("mimeType", file.type);
          formData.append("chunkIndex", i.toString());
          formData.append("totalChunks", totalChunks.toString());
          formData.append("uploadId", uploadId);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) throw new Error("Upload failed");
          
          setUploads((prev) => 
            prev.map((u) => u.id === uploadId ? { ...u, progress: Math.round(((i + 1) / totalChunks) * 100) } : u)
          );
        }
        onUploadComplete();
      } catch (error) {
        setUploads((prev) => 
          prev.map((u) => u.id === uploadId ? { ...u, error: "Upload failed" } : u)
        );
      }
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 transition-colors text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className={`w-10 h-10 mx-auto mb-4 ${isDragActive ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}`} />
        <p className="text-slate-700 dark:text-slate-300 font-medium">
          {isDragActive ? "Drop the files here" : "Drag & drop files here, or click to select"}
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Supports any file up to 2.0 GB (Bypassing Telegram 50MB limit)
        </p>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((u) => (
            <div key={u.id} className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{u.name}</p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${u.error ? 'bg-red-500' : 'bg-blue-600'}`} 
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              </div>
              <div className="w-10 flex justify-end">
                {u.error ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : u.progress === 100 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <span className="text-xs font-semibold text-slate-600">{u.progress}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
