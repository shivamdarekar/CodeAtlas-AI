import { create } from 'zustand';

interface UiState {
  isSidebarOpen: boolean;
  activeView: 'chat' | 'canvas';
  setSidebarOpen: (isOpen: boolean) => void;
  setActiveView: (view: 'chat' | 'canvas') => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  activeView: 'chat',
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setActiveView: (view) => set({ activeView: view }),
}));
