"use client";
import { Folder, MoreVertical, Link as LinkIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function FolderList({ folders, onRefresh }: { folders: any[], onRefresh: () => void }) {
  const router = useRouter();
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedFolders(new Set());
  }, [folders]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  if (!folders || folders.length === 0) return null;

  const handleDragStart = (e: React.DragEvent, folderId: string) => {
    const idsToDrag = selectedFolders.has(folderId) ? Array.from(selectedFolders) : [folderId];
    
    e.dataTransfer.setData("application/json", JSON.stringify({
      type: "folders",
      ids: idsToDrag
    }));
    e.dataTransfer.effectAllowed = "move";

    if (idsToDrag.length > 1) {
      const badge = document.createElement("div");
      badge.textContent = idsToDrag.length.toString();
      Object.assign(badge.style, {
        backgroundColor: '#2563eb',
        color: 'white',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        position: 'absolute',
        top: '-1000px',
        left: '-1000px',
        zIndex: '9999',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        border: '2px solid white'
      });
      document.body.appendChild(badge);
      e.dataTransfer.setDragImage(badge, 16, 16);
      
      setTimeout(() => {
        if (document.body.contains(badge)) document.body.removeChild(badge);
      }, 0);
    }
  };

  const handleDrop = async (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDragOverId(null);
    
    // Try batch files/folders first
    const dataStr = e.dataTransfer.getData("application/json");
    if (dataStr) {
      try {
        const data = JSON.parse(dataStr);
        if (data.type === "files" && data.ids && data.ids.length > 0) {
          await fetch(`/api/files/batch`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "move", fileIds: data.ids, folderId })
          });
          onRefresh();
          return;
        } else if (data.type === "folders" && data.ids && data.ids.length > 0) {
          // moving folders into this folder
          await fetch(`/api/folders/batch`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "move", folderIds: data.ids, targetFolderId: folderId })
          });
          onRefresh();
          return;
        }
      } catch (err) {
        // Fallback below
      }
    }
    
    // Fallback for single file backward compatibility
    const fileId = e.dataTransfer.getData("fileid");
    if (fileId) {
      await fetch(`/api/files/${fileId}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId })
      });
      onRefresh();
    }
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData("application/json");
    try {
       const data = JSON.parse(dataStr || "{}");
       // Don't allow dropping a folder into itself or its own selection
       if (data.type === "folders" && data.ids?.includes(folderId)) {
          return;
       }
    } catch (err) {}
    setDragOverId(folderId);
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
    
    const newSet = new Set(selectedFolders);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedFolders(newSet);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Menghapus folder ini akan memindahkan semua file di dalamnya ke Trash. Lanjutkan?")) {
      await fetch(`/api/folders/${id}`, { method: 'DELETE' });
      onRefresh();
    }
  };

  const handleShare = async (id: string) => {
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId: id })
    });
    const data = await res.json();
    if (data.success) {
      const url = `${window.location.origin}${data.url}`;
      await navigator.clipboard.writeText(url);
      alert("Tautan folder berhasil disalin!");
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Folders</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {folders.map(folder => {
          const isSelected = selectedFolders.has(folder.id);
          return (
          <div 
            key={folder.id} 
            draggable
            onClick={(e) => toggleSelect(folder.id, e)}
            onDoubleClick={() => router.push(`/?folder=${folder.id}`)}
            onDragStart={(e) => handleDragStart(e, folder.id)}
            onDragOver={(e) => handleDragOver(e, folder.id)}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => handleDrop(e, folder.id)}
            className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all group select-none border border-transparent ${
              dragOverId === folder.id 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50' 
                : (isSelected 
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100' 
                    : 'bg-slate-100 dark:bg-[#28292c] hover:bg-slate-200 dark:hover:bg-[#343538]')
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Folder className={`w-6 h-6 shrink-0 transition-colors ${isSelected ? 'text-blue-600' : 'text-blue-500 group-hover:text-blue-600'}`} />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate" title={folder.name}>
                {folder.name}
              </span>
            </div>
            
            <div className="relative shrink-0 ml-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === folder.id ? null : folder.id); }}
                className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {activeMenuId === folder.id && (
                <div 
                  className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button onClick={() => { handleShare(folder.id); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors text-left">
                    <LinkIcon className="w-4 h-4" /> Get Share Link
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                  <button onClick={() => { handleDelete(folder.id); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                    <Trash2 className="w-4 h-4" /> Delete Folder
                  </button>
                </div>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
