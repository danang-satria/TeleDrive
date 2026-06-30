"use client";
import { Cloud, FolderPlus, Clock, Trash, Trash2, Settings, Plus, UploadCloud, Database, HardDrive } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDriveStore } from "@/lib/store";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openCreateFolderModal } = useDriveStore();
  const [analytics, setAnalytics] = useState({ totalSize: 0, totalFiles: 0 });
  const [showNewMenu, setShowNewMenu] = useState(false);

  useEffect(() => {
    fetch("/api/analytics")
      .then(res => res.json())
      .then(data => {
        if (!data.error) setAnalytics(data);
      })
      .catch(console.error);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = () => setShowNewMenu(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `w-full flex items-center gap-4 px-4 py-2.5 text-sm font-medium rounded-full transition-colors ${
      isActive 
        ? "bg-blue-100 dark:bg-[#c2e7ff] text-blue-900 dark:text-[#001d35]" 
        : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
    }`;
  };

  return (
    <div className="w-64 h-full bg-slate-100 dark:bg-slate-950 p-4 flex flex-col transition-colors duration-200">
      
      <div className="relative mb-6">
        <button 
          onClick={(e) => { e.stopPropagation(); setShowNewMenu(!showNewMenu); }}
          className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium border border-slate-200 dark:border-slate-700/50"
        >
          <Plus className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          <span className="text-sm">New</span>
        </button>

        {showNewMenu && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
            <button 
              onClick={() => {
                if (pathname !== "/") router.push("/");
                setTimeout(() => openCreateFolderModal(), 100);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FolderPlus className="w-4 h-4 text-slate-500" /> New Folder
            </button>
            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
            <button onClick={() => { setShowNewMenu(false); document.getElementById('global-file-upload')?.click(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <UploadCloud className="w-4 h-4 text-slate-500" /> File Upload
            </button>
          </div>
        )}
      </div>
      
      <nav className="flex-1 space-y-1">
        <Link href="/" className={getLinkClass("/")}>
          <HardDrive className="w-5 h-5" />
          My Drive
        </Link>
        <Link href="/recent" className={getLinkClass("/recent")}>
          <Clock className="w-5 h-5" />
          Recent
        </Link>
        <Link href="/trash" className={getLinkClass("/trash")}>
          <Trash className="w-5 h-5" />
          Trash
        </Link>
      </nav>

      <div className="mt-auto pt-4 space-y-4 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold text-sm mb-1">
            <Cloud className="w-4 h-4" /> Storage
          </div>
          <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
            <span>{formatSize(analytics.totalSize)}</span>
            <span>{analytics.totalFiles} files</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-500 h-full w-full opacity-50 animate-pulse"></div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Unlimited Telegram Drive</p>
        </div>

        <Link href="/settings" className={getLinkClass("/settings")}>
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </div>
  );
}
