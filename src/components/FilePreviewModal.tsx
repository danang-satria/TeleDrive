"use client";

import { X, ExternalLink, Download } from "lucide-react";
import { useDriveStore } from "@/lib/store";

export default function FilePreviewModal() {
  const { previewFile, closePreview } = useDriveStore();

  if (!previewFile) return null;

  const isImage = previewFile.mimeType.startsWith('image/');
  const isVideo = previewFile.mimeType.startsWith('video/');
  const isAudio = previewFile.mimeType.startsWith('audio/');
  const isPdf = previewFile.mimeType === 'application/pdf';
  
  const canPreview = isImage || isVideo || isAudio || isPdf;
  const fileUrl = `/api/files/${previewFile.id}?view=true`;
  const streamUrl = `/api/files/${previewFile.id}/stream`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between text-white z-10 bg-gradient-to-b from-black/50 to-transparent">
          <h2 className="text-lg font-medium truncate max-w-2xl" title={previewFile.name}>
            {previewFile.name}
          </h2>
          <div className="flex items-center gap-3">
            <a 
              href={`/api/files/${previewFile.id}`}
              download
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            {canPreview && (
              <a 
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
            <button 
              onClick={closePreview}
              className="p-2 bg-white/10 hover:bg-red-500/80 rounded-full transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="w-full h-full max-w-6xl max-h-[85vh] mt-12 flex items-center justify-center">
          {isImage && (
            <img 
              src={fileUrl} 
              alt={previewFile.name} 
              className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-sm"
            />
          )}

          {isVideo && (
            <video 
              src={streamUrl} 
              controls 
              autoPlay
              className="max-w-full max-h-full drop-shadow-2xl rounded-xl outline-none bg-black"
            />
          )}

          {isAudio && (
            <div className="bg-slate-800/80 p-8 rounded-3xl border border-slate-700 w-full max-w-md shadow-2xl">
              <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full animate-pulse" />
              </div>
              <audio 
                src={streamUrl} 
                controls 
                autoPlay
                className="w-full"
              />
            </div>
          )}

          {isPdf && (
            <iframe 
              src={`${fileUrl}#toolbar=0`} 
              className="w-full h-full rounded-xl bg-white shadow-2xl border border-slate-800"
              title={previewFile.name}
            />
          )}

          {!canPreview && (
            <div className="text-center p-8 bg-slate-800/80 border border-slate-700 rounded-3xl max-w-md shadow-2xl">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Preview Available</h3>
              <p className="text-slate-400 mb-6">This file type ({previewFile.mimeType}) cannot be previewed in the browser.</p>
              <a 
                href={`/api/files/${previewFile.id}`}
                download
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl inline-flex items-center gap-2 font-medium transition-colors"
              >
                <Download className="w-5 h-5" />
                Download File Instead
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
