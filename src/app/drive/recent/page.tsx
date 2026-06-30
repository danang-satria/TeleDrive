"use client";
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import FileList from "@/components/FileList";

export default function RecentPage() {
  const [files, setFiles] = useState([]);
  const [isGridView, setIsGridView] = useState(true);

  const fetchFiles = async () => {
    const res = await fetch("/api/files?recent=true");
    const data = await res.json();
    setFiles(data);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 flex-1 flex flex-col h-full">
      <div className="flex items-center gap-3">
        <Clock className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Recent Files</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Files uploaded in the last 7 days</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        <div className="pb-4 flex justify-between items-center">
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
        <div className="flex-1 overflow-y-auto">
          <FileList files={files} onDelete={fetchFiles} isGridView={isGridView} endpoint="/api/files" />
        </div>
      </div>
    </div>
  );
}
