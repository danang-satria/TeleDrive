import { prisma } from "@/lib/db";
import { Cloud, Download, FileIcon, Image as ImageIcon, Video, FileText, FileArchive, Folder as FolderIcon } from "lucide-react";
import { notFound } from "next/navigation";

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getIcon = (mimeType: string, className = "w-16 h-16") => {
  if (mimeType.startsWith("image/")) return <ImageIcon className={`${className} text-blue-500 mx-auto`} />;
  if (mimeType.startsWith("video/")) return <Video className={`${className} text-purple-500 mx-auto`} />;
  if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("rar")) return <FileArchive className={`${className} text-orange-500 mx-auto`} />;
  if (mimeType.includes("pdf") || mimeType.includes("text")) return <FileText className={`${className} text-red-500 mx-auto`} />;
  return <FileIcon className={`${className} text-slate-500 mx-auto`} />;
};

export default async function SharedFilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const link = await prisma.sharedLink.findUnique({
    where: { id },
    include: { 
      file: true,
      folder: {
        include: {
          files: { where: { isDeleted: false } }
        }
      }
    }
  });

  if (!link) return notFound();
  
  if (link.file && !link.file.isDeleted) {
    const file = link.file;
    return (
      <div className="flex-1 min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-2 mb-8">
          <Cloud className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">TeleDrive</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-md w-full shadow-xl border border-slate-200 dark:border-slate-800 text-center">
          <div className="mb-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            {getIcon(file.mimeType)}
          </div>
          
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 truncate" title={file.name}>
            {file.name}
          </h1>
          
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-8">
            <span>{formatSize(file.size)}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
            <span className="uppercase">{file.mimeType.split('/')[1] || 'FILE'}</span>
          </div>

          <a 
            href={`/api/share/${link.id}/download`}
            download
            className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-semibold text-lg shadow-md shadow-blue-500/20"
          >
            <Download className="w-5 h-5" /> Download File
          </a>

          <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
            Shared via TeleDrive
          </p>
        </div>
      </div>
    );
  } else if (link.folder) {
    const folder = link.folder;
    return (
      <div className="flex-1 min-h-screen bg-slate-100 dark:bg-slate-950 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Cloud className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">TeleDrive</span>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <FolderIcon className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{folder.name}</h1>
                <p className="text-sm text-slate-500">{folder.files.length} items shared via TeleDrive</p>
              </div>
            </div>

            {folder.files.length === 0 ? (
              <div className="text-center py-12 text-slate-500">Folder is empty</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {folder.files.map(f => (
                  <div key={f.id} className="group relative bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col">
                    <div className="flex items-center justify-between p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative z-20">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getIcon(f.mimeType, 'w-4 h-4 shrink-0')}
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate" title={f.name}>
                          {f.name}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-28 flex items-center justify-center bg-white dark:bg-slate-900/30">
                       {getIcon(f.mimeType, 'w-12 h-12')}
                    </div>
                    <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-30">
                       <a 
                         href={`/api/files/${f.id}`}
                         target="_blank"
                         download
                         className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors font-medium text-sm"
                         title="Download"
                       >
                         <Download className="w-4 h-4" /> Download
                       </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return notFound();
}
