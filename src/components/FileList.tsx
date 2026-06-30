"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FileIcon, Download, Trash2, FileText, Image as ImageIcon, Video, FileArchive, RefreshCcw, Share2, Link, MoreVertical, Star, StarOff } from "lucide-react";
import { useDriveStore } from "@/lib/store";

export type FileRecord = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  mimeType: string;
  createdAt: string;
  isStarred?: boolean;
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getIcon = (mimeType: string, className = "w-16 h-16") => {
  if (mimeType.startsWith("image/")) return <ImageIcon className={`${className} text-blue-500`} />;
  if (mimeType.startsWith("video/")) return <Video className={`${className} text-purple-500`} />;
  if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("rar")) return <FileArchive className={`${className} text-orange-500`} />;
  if (mimeType.includes("pdf") || mimeType.includes("text")) return <FileText className={`${className} text-red-500`} />;
  return <FileIcon className={`${className} text-slate-500`} />;
};

export default function FileList({ 
  files, 
  onDelete, 
  isGridView = true,
  endpoint = "/api/files",
  isTrash = false 
}: { 
  files: FileRecord[], 
  onDelete: (id: string) => void, 
  onRestore?: (id: string) => void,
  isGridView?: boolean,
  endpoint?: string,
  isTrash?: boolean 
}) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number, y: number } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const { openPreview } = useDriveStore();

  useEffect(() => {
    // Reset selection when switching folders or viewing different file sets
    setSelectedFiles(new Set());
  }, [files]);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuId(null);
      setMenuPos(null);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
    onDelete(id);
  };

  const handleRestore = async (id: string) => {
    await fetch(`${endpoint}/${id}`, { method: 'PUT' });
    window.location.reload();
  };

  const handleShare = async (id: string) => {
    try {
      const res = await fetch(`/api/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: id })
      });
      const data = await res.json();
      if (data.url) {
        const fullUrl = `${window.location.origin}${data.url}`;
        await navigator.clipboard.writeText(fullUrl);
        alert('Public link copied to clipboard!');
      }
    } catch (e) {
      alert('Failed to generate link');
    }
  };

  const handleStar = async (id: string, currentStatus: boolean) => {
    await fetch('/api/star', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type: 'file', isStarred: !currentStatus })
    });
    onDelete(id); // Using onDelete as onRefresh here
  };

  const handleDragStart = (e: React.DragEvent, fileId: string) => {
    const idsToDrag = selectedFiles.has(fileId) ? Array.from(selectedFiles) : [fileId];
    
    e.dataTransfer.setData("application/json", JSON.stringify({
      type: "files",
      ids: idsToDrag
    }));
    e.dataTransfer.effectAllowed = "move";

    if (idsToDrag.length > 1) {
      const badge = document.createElement("div");
      badge.textContent = idsToDrag.length.toString();
      // Apply inline styles to ensure it renders correctly outside the React DOM
      Object.assign(badge.style, {
        backgroundColor: '#2563eb', // blue-600
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
      
      // Clean up badge immediately after setting it as drag image
      setTimeout(() => {
        if (document.body.contains(badge)) {
          document.body.removeChild(badge);
        }
      }, 0);
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    // Prevent selection when clicking on buttons or links
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
    
    const newSet = new Set(selectedFiles);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedFiles(newSet);
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <FileIcon className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">No files {isTrash ? 'in trash' : 'uploaded yet'}</p>
        <p className="text-sm">{isTrash ? 'Your deleted files will appear here' : 'Upload some files to get started'}</p>
      </div>
    );
  }

  if (isGridView) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {files.map(file => {
          const isSelected = selectedFiles.has(file.id);
          return (
          <div 
            key={file.id} 
            draggable
            onDragStart={(e) => handleDragStart(e, file.id)}
            onClick={(e) => toggleSelect(file.id, e)}
            onDoubleClick={() => openPreview({ id: file.id, name: file.name, mimeType: file.mimeType })}
            onContextMenu={(e) => {
              e.preventDefault();
              setActiveMenuId(file.id);
              setMenuPos({ x: e.clientX, y: e.clientY });
            }}
            className={`group relative bg-slate-100 dark:bg-[#28292c] rounded-2xl overflow-hidden hover:bg-slate-200 dark:hover:bg-[#343538] transition-all cursor-move flex flex-col select-none border border-transparent ${isSelected ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100' : ''}`}
          >
            <div className={`w-full aspect-[4/3] flex items-center justify-center relative overflow-hidden ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'bg-white dark:bg-[#1a1c1e]'}`}>
              {file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/') ? (
                <img 
                  src={`${endpoint}/${file.id}/thumb`} 
                  alt={file.name} 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('fallback-icon');
                  }}
                />
              ) : (
                getIcon(file.mimeType, 'w-16 h-16 mx-auto opacity-70')
              )}
              <div className="hidden fallback-icon-container absolute inset-0 flex items-center justify-center">
                {getIcon(file.mimeType, 'w-16 h-16 mx-auto opacity-70')}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getIcon(file.mimeType, 'w-5 h-5 shrink-0')}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate" title={file.name}>
                  {file.name}
                </span>
                {file.isStarred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />}
              </div>
              
              <div className="relative shrink-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === file.id ? null : file.id); setMenuPos(null); }}
                  className="p-1.5 rounded-full hover:bg-slate-300/50 dark:hover:bg-slate-700/50 text-slate-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {activeMenuId === file.id && (
                  <div 
                    className={`${menuPos ? 'fixed' : 'absolute right-0 bottom-full mb-1'} w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 overflow-hidden`}
                    style={menuPos ? { left: menuPos.x, top: menuPos.y } : undefined}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!isTrash && (
                      <>
                        <a href={`${endpoint}/${file.id}`} target="_blank" download className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors">
                          <Download className="w-4 h-4" /> Download
                        </a>
                        <button onClick={() => { handleShare(file.id); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors text-left">
                          <Link className="w-4 h-4" /> Get Share Link
                        </button>
                        <button onClick={() => { handleStar(file.id, !!file.isStarred); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 transition-colors text-left">
                          {file.isStarred ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                          {file.isStarred ? 'Remove from Starred' : 'Add to Starred'}
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                        <button onClick={() => { handleDelete(file.id); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                          <Trash2 className="w-4 h-4" /> Move to Trash
                        </button>
                      </>
                    )}
                    {isTrash && (
                      <button onClick={() => { handleRestore(file.id); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left">
                        <RefreshCcw className="w-4 h-4" /> Restore File
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )})}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-500">
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3 hidden md:table-cell">Date Modified</th>
            <th className="px-6 py-3 hidden sm:table-cell">Size</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {files.map(file => {
            const isSelected = selectedFiles.has(file.id);
            return (
            <tr 
              key={file.id} 
              draggable
              onClick={(e) => toggleSelect(file.id, e)}
              onDoubleClick={() => openPreview({ id: file.id, name: file.name, mimeType: file.mimeType })}
              onContextMenu={(e) => {
                e.preventDefault();
                setActiveMenuId(file.id);
                setMenuPos({ x: e.clientX, y: e.clientY });
              }}
              onDragStart={(e) => handleDragStart(e, file.id)}
              className={`group transition-colors cursor-move ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  {getIcon(file.mimeType, 'w-8 h-8')}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[200px] md:max-w-xs lg:max-w-md truncate" title={file.name}>
                    {file.name}
                  </span>
                  {file.isStarred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">
                {format(new Date(file.createdAt), "MMM d, yyyy")}
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 hidden sm:table-cell">
                {formatSize(file.size)}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="relative inline-block text-left">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === file.id ? null : file.id); setMenuPos(null); }}
                    className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {activeMenuId === file.id && (
                    <div 
                      className={`${menuPos ? 'fixed' : 'absolute right-0 top-full mt-1'} w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 overflow-hidden`}
                      style={menuPos ? { left: menuPos.x, top: menuPos.y } : undefined}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!isTrash && (
                        <>
                          <a href={`${endpoint}/${file.id}`} target="_blank" download className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors">
                            <Download className="w-4 h-4" /> Download
                          </a>
                          <button onClick={() => { handleShare(file.id); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors text-left">
                            <Link className="w-4 h-4" /> Get Share Link
                          </button>
                          <button onClick={() => { handleStar(file.id, !!file.isStarred); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 transition-colors text-left">
                            {file.isStarred ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                            {file.isStarred ? 'Remove from Starred' : 'Add to Starred'}
                          </button>
                          <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                          <button onClick={() => { handleDelete(file.id); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                            <Trash2 className="w-4 h-4" /> Move to Trash
                          </button>
                        </>
                      )}
                      {isTrash && (
                        <button onClick={() => { handleRestore(file.id); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left">
                          <RefreshCcw className="w-4 h-4" /> Restore File
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  );
}
