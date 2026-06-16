import { create } from 'zustand';

export interface UiState {
  activeModal: string | null;
  sidebarOpen: boolean;
}

export interface UiActions {
  openModal: (modalId: string) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
}

export type UiStore = UiState & UiActions;

export const useUiStore = create<UiStore>((set) => ({
  activeModal: null,
  sidebarOpen: true,

  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
}));
