"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import UploadZone from "@/components/UploadZone";
import FileList from "@/components/FileList";

export default function Home() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [isGridView, setIsGridView] = useState(true);

  const fetchFiles = async (q = "") => {
    const res = await fetch(`/api/files?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setFiles(data);
  };

  useEffect(() => {
    fetchFiles(search);
  }, [search]);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 flex-1 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Drive</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Store and share files securely</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <UploadZone onUploadComplete={() => fetchFiles(search)} />
      
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
          <FileList files={files} onDelete={() => fetchFiles(search)} isGridView={isGridView} endpoint="/api/files" />
        </div>
      </div>
    </div>
  );
}
