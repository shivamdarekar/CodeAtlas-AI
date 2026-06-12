import { create } from 'zustand';

interface AppState {
  activeRepoId: string | null;
  setActiveRepoId: (id: string | null) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  addChatMessage: (message: { role: 'user' | 'assistant'; content: string }) => void;
  clearChatHistory: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeRepoId: null,
  setActiveRepoId: (id) => set({ activeRepoId: id }),
  isSidebarOpen: true,
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  chatHistory: [],
  addChatMessage: (message) => set((state) => ({ chatHistory: [...state.chatHistory, message] })),
  clearChatHistory: () => set({ chatHistory: [] }),
}));
