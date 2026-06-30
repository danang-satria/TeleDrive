import { create } from 'zustand';

interface DriveState {
  isCreateFolderModalOpen: boolean;
  openCreateFolderModal: () => void;
  closeCreateFolderModal: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const useDriveStore = create<DriveState>((set) => ({
  isCreateFolderModalOpen: false,
  openCreateFolderModal: () => set({ isCreateFolderModalOpen: true }),
  closeCreateFolderModal: () => set({ isCreateFolderModalOpen: false }),
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
