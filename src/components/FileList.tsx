"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FileIcon, Download, Trash2, FileText, Image, Video, FileArchive, RefreshCcw } from "lucide-react";

export type FileRecord = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return <Image className="w-8 h-8 text-blue-500" />;
  if (mimeType.startsWith("video/")) return <Video className="w-8 h-8 text-purple-500" />;
  if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("rar")) return <FileArchive className="w-8 h-8 text-orange-500" />;
  if (mimeType.includes("pdf") || mimeType.includes("text")) return <FileText className="w-8 h-8 text-red-500" />;
  return <FileIcon className="w-8 h-8 text-slate-500" />;
};

export default function FileList({ 
  files: initialFiles, 
  onDelete, 
  isGridView,
  endpoint = "/api/files",
  isTrash = false
}: { 
  files: FileRecord[], 
  onDelete: (id: string) => void, 
  onRestore?: (id: string) => void,
  isGridView: boolean,
  endpoint?: string,
  isTrash?: boolean 
}) {
  const [files, setFiles] = useState<FileRecord[]>(initialFiles);

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const handleDelete = async (id: string) => {
    await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
    onDelete(id);
  };

  const handleRestore = async (id: string) => {
    await fetch(`${endpoint}/${id}`, { method: 'PUT' });
    window.location.reload();
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {files.map(file => (
          <div key={file.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="w-full h-32 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 relative">
              {file.mimeType.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={`${endpoint}/${file.id}?view=true`} 
                  alt={file.name} 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
              ) : (
                getIcon(file.mimeType)
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate w-full text-center" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-slate-500 text-center mt-1">{formatSize(file.size)}</p>
            </div>
            
            <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
              {!isTrash ? (
                <a 
                  href={`${endpoint}/${file.id}`}
                  target="_blank"
                  download
                  className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
              ) : (
                <button 
                  onClick={() => handleRestore(file.id)}
                  className="p-2 bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                  title="Restore"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={() => handleDelete(file.id)}
                className="p-2 bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3 hidden md:table-cell">Date Modified</th>
            <th className="px-6 py-3 hidden sm:table-cell">Size</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {files.map(file => (
            <tr key={file.id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-6 py-4 flex items-center gap-3">
                {getIcon(file.mimeType)}
                <span className="text-sm font-medium text-slate-700 max-w-[200px] md:max-w-xs lg:max-w-md truncate" title={file.name}>
                  {file.name}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">
                {format(new Date(file.createdAt), "MMM d, yyyy")}
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 hidden sm:table-cell">
                {formatSize(file.size)}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isTrash ? (
                    <a 
                      href={`${endpoint}/${file.id}`}
                      target="_blank"
                      download
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  ) : (
                    <button 
                      onClick={() => handleRestore(file.id)}
                      className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(file.id)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
