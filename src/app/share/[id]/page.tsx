"use client";
import { useEffect, useState } from "react";
import { Cloud, Download, FileIcon, Loader2, Image as ImageIcon, Video, FileText, FileArchive } from "lucide-react";
import Link from "next/link";

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

export default function PublicSharePage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/share/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error("Link not found or expired");
        return res.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileIcon className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">File Not Found</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">The link might be invalid, expired, or the file was deleted by the owner.</p>
          <Link href="/" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium">
            Go to TeleDrive
          </Link>
        </div>
      </div>
    );
  }

  const { file, folder } = data;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0b] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none"></div>
      
      <header className="p-6 relative z-10">
        <Link href="/" className="flex items-center gap-2 max-w-7xl mx-auto">
          <Cloud className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            TeleDrive
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="max-w-md w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
          
          <div className="mb-6 flex justify-center">
            {file ? getIcon(file.mimeType, 'w-24 h-24') : <FileArchive className="w-24 h-24 text-orange-500" />}
          </div>

          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 truncate" title={file ? file.name : folder.name}>
            {file ? file.name : folder.name}
          </h1>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
            {file ? formatSize(file.size) : 'Shared Folder'} • Shared via TeleDrive
          </p>

          <a 
            href={`/api/share/${params.id}/download`}
            target="_blank"
            download
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/25"
          >
            <Download className="w-5 h-5" />
            Download {file ? 'File' : 'ZIP'}
          </a>
        </div>
      </main>
    </div>
  );
}
