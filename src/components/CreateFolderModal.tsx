"use client";

import { useState, useRef, useEffect } from "react";
import { FolderPlus, X, Loader2 } from "lucide-react";
import { useDriveStore } from "@/lib/store";
import { useSearchParams } from "next/navigation";
import { mutate } from "swr";

export default function CreateFolderModal() {
  const { isCreateFolderModalOpen, closeCreateFolderModal, triggerRefresh } = useDriveStore();
  const [folderName, setFolderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folder") || "root";

  useEffect(() => {
    if (isCreateFolderModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreateFolderModalOpen]);

  if (!isCreateFolderModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: folderName.trim(), 
          parentId: folderId === "root" ? null : folderId 
        })
      });
      setFolderName("");
      triggerRefresh();
      
      // Trigger SWR revalidation
      mutate(`/api/folders${folderId !== 'root' ? `?parentId=${folderId}` : ''}`);
      
      closeCreateFolderModal();
    } catch (error) {
      console.error("Failed to create folder", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1c1e] w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-blue-500" />
            Folder Baru
          </h2>
          <button 
            onClick={closeCreateFolderModal}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Nama Folder
          </label>
          <input
            ref={inputRef}
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Ketik nama folder..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#212327] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={isSubmitting}
          />
          
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={closeCreateFolderModal}
              className="px-5 py-2.5 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!folderName.trim() || isSubmitting}
              className="px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Buat Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
