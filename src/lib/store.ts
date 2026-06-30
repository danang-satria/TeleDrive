import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export type UploadStatus = 'uploading' | 'paused' | 'completed' | 'error';

export interface UploadItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: UploadStatus;
  error?: string;
  file: File;
  folderId: string;
  totalChunks: number;
  currentChunk: number;
}

interface DriveState {
  isCreateFolderModalOpen: boolean;
  openCreateFolderModal: () => void;
  closeCreateFolderModal: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
  
  previewFile: { id: string, name: string, mimeType: string } | null;
  openPreview: (file: { id: string, name: string, mimeType: string }) => void;
  closePreview: () => void;

  uploads: UploadItem[];
  addUploads: (files: File[], folderId: string) => void;
  pauseUpload: (id: string) => void;
  resumeUpload: (id: string) => void;
  cancelUpload: (id: string) => void;
  clearCompletedUploads: () => void;
  _processUploadQueue: () => void;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export const useDriveStore = create<DriveState>((set, get) => ({
  isCreateFolderModalOpen: false,
  openCreateFolderModal: () => set({ isCreateFolderModalOpen: true }),
  closeCreateFolderModal: () => set({ isCreateFolderModalOpen: false }),
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),

  previewFile: null,
  openPreview: (file) => set({ previewFile: file }),
  closePreview: () => set({ previewFile: null }),

  uploads: [],

  addUploads: (files: File[], folderId: string) => {
    const newUploads = files.map(file => ({
      id: uuidv4(),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading' as UploadStatus,
      file,
      folderId,
      totalChunks: Math.ceil(file.size / CHUNK_SIZE),
      currentChunk: 0,
    }));

    set(state => ({ uploads: [...state.uploads, ...newUploads] }));
    get()._processUploadQueue();
  },

  pauseUpload: (id: string) => {
    set(state => ({
      uploads: state.uploads.map(u => u.id === id ? { ...u, status: 'paused' } : u)
    }));
  },

  resumeUpload: (id: string) => {
    set(state => ({
      uploads: state.uploads.map(u => u.id === id ? { ...u, status: 'uploading' } : u)
    }));
    get()._processUploadQueue();
  },

  cancelUpload: (id: string) => {
    set(state => ({
      uploads: state.uploads.filter(u => u.id !== id)
    }));
  },

  clearCompletedUploads: () => {
    set(state => ({
      uploads: state.uploads.filter(u => u.status !== 'completed')
    }));
  },

  _processUploadQueue: async () => {
    const state = get();
    // Find one uploading file to process (we do one by one or chunk by chunk)
    // Actually, we can just trigger a loop for each uploading file that isn't actively being processed.
    // To keep it simple, we'll process chunks recursively.
    
    // We need a way to track if a worker is running for a file.
    // Zustand state updates are synchronous, but async functions run concurrently.
    // We'll iterate over uploads.
    const activeUploads = state.uploads.filter(u => u.status === 'uploading');
    
    for (const upload of activeUploads) {
      if (upload.currentChunk >= upload.totalChunks) continue;
      
      const file = upload.file;
      const i = upload.currentChunk;
      
      const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const formData = new FormData();
      formData.append("file", chunk);
      formData.append("fileName", file.name);
      formData.append("mimeType", file.type);
      formData.append("chunkIndex", i.toString());
      formData.append("totalChunks", upload.totalChunks.toString());
      formData.append("uploadId", upload.id);
      formData.append("folderId", upload.folderId);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const progress = Math.round(((i + 1) / upload.totalChunks) * 100);
        const isCompleted = i + 1 === upload.totalChunks;

        set(state => ({
          uploads: state.uploads.map(u => {
            if (u.id === upload.id) {
              // Ensure we only update if it hasn't been paused/cancelled during fetch
              if (u.status !== 'uploading') return u;
              return { 
                ...u, 
                progress, 
                currentChunk: i + 1,
                status: isCompleted ? 'completed' : 'uploading'
              };
            }
            return u;
          })
        }));

        if (isCompleted) {
          toast.success(`"${file.name}" berhasil diunggah.`);
          get().triggerRefresh();
        } else {
          // Process next chunk if still uploading
          const currentStatus = get().uploads.find(u => u.id === upload.id)?.status;
          if (currentStatus === 'uploading') {
            setTimeout(() => get()._processUploadQueue(), 10);
          }
        }
      } catch (error) {
        set(state => ({
          uploads: state.uploads.map(u => u.id === upload.id ? { ...u, status: 'error', error: "Upload failed" } : u)
        }));
        toast.error(`Gagal mengunggah "${file.name}".`);
      }
    }
  }
}));
