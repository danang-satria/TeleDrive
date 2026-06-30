"use client";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import useSWR from "swr";
import FileList from "@/components/FileList";
import FolderList from "@/components/FolderList";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function StarredPage() {
  const [isGridView, setIsGridView] = useState(true);

  const { data: files, mutate: mutateFiles } = useSWR("/api/files?starred=true", fetcher);
  const { data: folders, mutate: mutateFolders } = useSWR("/api/folders?starred=true", fetcher);

  const safeFiles = files || [];
  const safeFolders = folders || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto w-full space-y-6 flex-1 flex flex-col h-full">
      <div className="flex items-center gap-3">
        <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Starred</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Your favorite files and folders</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        <div className="pb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsGridView(true)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isGridView ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setIsGridView(false)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${!isGridView ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              List
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-2">
          {!files && !folders && <div className="p-8 text-center text-slate-500">Memuat...</div>}
          <FolderList folders={safeFolders} onRefresh={() => mutateFolders()} />
          <FileList files={safeFiles} onDelete={() => mutateFiles()} isGridView={isGridView} endpoint="/api/files" />
        </div>
      </div>
    </div>
  );
}
