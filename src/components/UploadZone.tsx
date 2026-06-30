"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { useDriveStore } from "@/lib/store";

export default function UploadZone({ folderId = "root" }: { folderId?: string }) {
  const { addUploads } = useDriveStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      addUploads(acceptedFiles, folderId);
    }
  }, [addUploads, folderId]);

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

    </div>
  );
}
