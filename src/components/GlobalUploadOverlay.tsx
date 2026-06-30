"use client";
import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Pause, Play, AlertCircle, FileIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useDriveStore } from "@/lib/store";

export default function GlobalUploadOverlay() {
  const [isDragging, setIsDragging] = useState(false);
  
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folder") || "root";
  
  const { uploads, addUploads, pauseUpload, resumeUpload, cancelUpload, clearCompletedUploads } = useDriveStore();

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) {
        setIsDragging(true);
      }
    };
    
    window.addEventListener("dragenter", handleDragEnter);
    return () => window.removeEventListener("dragenter", handleDragEnter);
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsDragging(false);
    if (acceptedFiles.length === 0) return;
    
    addUploads(acceptedFiles, folderId);
  }, [folderId, addUploads]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true
  });

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.clientX === 0 && e.clientY === 0) {
      setIsDragging(false);
    }
  };

  const hasActiveUploads = uploads.length > 0;
  const isAllCompleted = hasActiveUploads && uploads.every(u => u.status === 'completed');

  return (
    <>
      {/* Global Drag Overlay */}
      {isDragging && (
        <div 
          {...getRootProps()}
          onDragLeave={handleDragLeave}
          className={`fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm transition-all duration-300
            ${isDragActive ? 'bg-blue-900/60' : 'bg-slate-900/40'}
          `}
        >
          <input {...getInputProps()} />
          <div className="border-4 border-dashed border-blue-400 dark:border-blue-500 bg-white/10 rounded-3xl p-12 text-center pointer-events-none">
            <UploadCloud className="w-24 h-24 mx-auto mb-6 text-blue-400 animate-bounce" />
            <h2 className="text-4xl font-bold text-white mb-4 shadow-black drop-shadow-md">Lepaskan File di Sini</h2>
            <p className="text-blue-100 text-lg shadow-black drop-shadow-md">File akan otomatis diunggah ke TeleDrive (Maks. 2GB)</p>
          </div>
        </div>
      )}

      {/* Floating Upload Queue Manager */}
      {hasActiveUploads && (
        <div className="fixed bottom-6 right-6 z-[90] w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[60vh]">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-500" />
              {isAllCompleted ? 'Selesai Mengunggah' : 'Mengunggah File...'}
            </h3>
            {isAllCompleted ? (
              <button onClick={clearCompletedUploads} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            ) : null}
          </div>
          
          <div className="overflow-y-auto p-4 space-y-3">
            {uploads.map(u => (
              <div key={u.id} className="bg-slate-50 dark:bg-[#1a1c1e] border border-slate-100 dark:border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 truncate">
                    <FileIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate" title={u.name}>{u.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {u.status === 'uploading' && (
                      <button onClick={() => pauseUpload(u.id)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500 hover:text-amber-500" title="Jeda">
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {u.status === 'paused' && (
                      <button onClick={() => resumeUpload(u.id)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500 hover:text-blue-500" title="Lanjutkan">
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {(u.status === 'uploading' || u.status === 'paused' || u.status === 'error') && (
                      <button onClick={() => cancelUpload(u.id)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500 hover:text-red-500" title="Batalkan">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      u.status === 'error' ? 'bg-red-500' : 
                      u.status === 'paused' ? 'bg-amber-500' : 
                      u.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                    }`} 
                    style={{ width: `${Math.max(2, u.progress)}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {u.status === 'error' ? 'Gagal' : 
                     u.status === 'paused' ? 'Dijeda' : 
                     u.status === 'completed' ? 'Selesai' : 
                     `${u.progress}%`}
                  </span>
                  {u.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
