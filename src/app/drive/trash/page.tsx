"use client";
import { useState, useEffect } from "react";
import { Trash, Trash2 } from "lucide-react";
import FileList from "@/components/FileList";

export default function TrashPage() {
  const [files, setFiles] = useState([]);
  const [isGridView, setIsGridView] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  const fetchFiles = async () => {
    const res = await fetch("/api/trash");
    const data = await res.json();
    setFiles(data);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleEmptyTrash = async () => {
    if (!confirm("Are you sure you want to permanently delete all files in the trash? This cannot be undone.")) return;
    setIsClearing(true);
    await fetch("/api/trash", { method: "DELETE" });
    setIsClearing(false);
    fetchFiles();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 flex-1 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trash className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Trash</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Deleted files will be kept here until you empty the trash.</p>
          </div>
        </div>
        {files.length > 0 && (
          <button 
            onClick={handleEmptyTrash}
            disabled={isClearing}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg transition-colors font-medium text-sm"
          >
            <Trash2 className="w-4 h-4" />
            {isClearing ? "Emptying..." : "Empty Trash"}
          </button>
        )}
      </div>
      
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200">Files</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsGridView(true)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isGridView ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setIsGridView(false)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${!isGridView ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              List
            </button>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <FileList files={files} onDelete={fetchFiles} isGridView={isGridView} endpoint="/api/trash" isTrash={true} />
        </div>
      </div>
    </div>
  );
}
