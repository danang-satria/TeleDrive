"use client";
import { useState, useEffect, Suspense } from "react";
import { FolderPlus, ChevronRight, ChevronDown, Home as HomeIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useDriveStore } from "@/lib/store";
import UploadZone from "@/components/UploadZone";
import FileList from "@/components/FileList";
import FolderList from "@/components/FolderList";

const fetcher = (url: string) => fetch(url).then(res => res.json());

function DashboardContent() {
  const [filterType, setFilterType] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folder") || "root";
  const search = searchParams.get("q") || "";
  const router = useRouter();

  const { refreshTrigger } = useDriveStore();

  let fileUrl = `/api/files?q=${encodeURIComponent(search)}&folderId=${folderId}`;
  if (filterType) fileUrl += `&type=${filterType}`;
  
  const folderUrl = (!search && !filterType) ? `/api/folders${folderId !== 'root' ? `?parentId=${folderId}` : ''}` : null;
  const breadcrumbsUrl = (!search && !filterType && folderId !== 'root') ? `/api/folders/breadcrumbs?folderId=${folderId}` : null;

  const { data: files, mutate: mutateFiles } = useSWR(fileUrl, fetcher);
  const { data: folders, mutate: mutateFolders } = useSWR(folderUrl, fetcher);
  const { data: breadcrumbs } = useSWR(breadcrumbsUrl, fetcher);

  useEffect(() => {
    if (refreshTrigger > 0) {
      mutateFiles();
      mutateFolders();
    }
  }, [refreshTrigger, mutateFiles, mutateFolders]);

  useEffect(() => {
    fetch("/api/settings/check-session")
      .then(res => {
        if (res.status === 401) setSessionError(true);
      })
      .catch(() => {});
  }, []);

  const safeFiles = files || [];
  const safeFolders = folders || [];
  const safeBreadcrumbs = breadcrumbs || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto w-full space-y-6 flex-1 flex flex-col h-full">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-2">
          {folderId === "root" ? (
            <h1 className="text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors -ml-2">
              My Drive <ChevronDown className="w-5 h-5 text-slate-500" />
            </h1>
          ) : (
            <div className="flex items-center gap-2 text-2xl text-slate-800 dark:text-slate-100 flex-wrap">
              <button onClick={() => router.push("/")} className="hover:bg-slate-100 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors -ml-2 flex items-center gap-2">
                My Drive
              </button>
              
              {safeBreadcrumbs.map((crumb: any, idx: number) => (
                <div key={crumb.id} className="flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                  <button 
                    onClick={() => router.push(`/?folder=${crumb.id}`)}
                    className={`p-2 rounded-xl transition-colors ${idx === safeBreadcrumbs.length - 1 ? 'font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {sessionError && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl shadow-sm border border-red-200 dark:border-red-800/50 flex items-start gap-3">
          <span>⚠️ <strong>Sesi Telegram telah berakhir.</strong> File tidak dapat diakses. Silakan perbarui sesi di Pengaturan.</span>
        </div>
      )}

      <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
        {['All', 'Image', 'Video', 'Document'].map((type) => {
          const val = type === 'All' ? '' : type.toLowerCase();
          const isActive = filterType === val;
          return (
            <button
              key={type}
              onClick={() => setFilterType(val)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive 
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-100' 
                  : 'bg-white dark:bg-[#1a1c1e] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {type === 'All' ? 'Type' : type}
            </button>
          );
        })}
      </div>
      
      {/* Hidden Global Upload Hook */}
      <UploadZone folderId={folderId} onUploadComplete={() => mutateFiles()} />
      
      <div className="flex-1 flex flex-col min-h-0">
        <div className="pb-4 flex justify-end items-center">
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

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
