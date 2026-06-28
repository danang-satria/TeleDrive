"use client";
import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GlobalUploadOverlay() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  // Listen for window drag events to show the overlay
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) {
        setIsDragging(true);
      }
    };
    
    // We only want to trigger dragging if it's a file
    window.addEventListener("dragenter", handleDragEnter);
    return () => window.removeEventListener("dragenter", handleDragEnter);
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsDragging(false);
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    setProgress(0);

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          setProgress((prev) => prev + (100 / acceptedFiles.length));
        }
      } catch (e) {
        console.error("Failed to upload", file.name);
      }
    }

    setIsUploading(false);
    setProgress(0);
    // Refresh the page or current view
    router.refresh();
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true, // Don't trigger file dialog on click since it's full screen
    noKeyboard: true
  });

  // Handle drag leave separately to hide overlay if they drag out of window
  const handleDragLeave = (e: React.DragEvent) => {
    // If we drag leave to the edge of the window, clientX/Y will be 0
    if (e.clientX === 0 && e.clientY === 0) {
      setIsDragging(false);
    }
  };

  if (!isDragging && !isUploading) return null;

  return (
    <div 
      {...getRootProps()}
      onDragLeave={handleDragLeave}
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300
        ${isDragActive || isUploading ? 'bg-blue-900/60' : 'bg-slate-900/40'}
      `}
    >
      <input {...getInputProps()} />
      
      <div className={`bg-white dark:bg-slate-900 rounded-2xl p-10 max-w-lg w-full text-center shadow-2xl mx-4 transform transition-all scale-100`}>
        {isUploading ? (
          <div>
            <UploadCloud className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-bounce" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Uploading Files...</h2>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mt-6 overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-300" 
                style={{ width: `${Math.max(5, progress)}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500 mt-2">{Math.round(progress)}% completed</p>
          </div>
        ) : (
          <div className="border-4 border-dashed border-blue-400 dark:border-blue-500 rounded-xl p-12">
            <UploadCloud className="w-20 h-20 mx-auto mb-6 text-blue-500" />
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Drop it here!</h2>
            <p className="text-slate-500 dark:text-slate-400">Release your mouse to upload the files instantly to TeleDrive.</p>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setIsDragging(false); }}
              className="mt-8 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium text-sm inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
