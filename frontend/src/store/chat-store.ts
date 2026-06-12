import { create } from 'zustand';

interface ChatState {
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  addChatMessage: (message: { role: 'user' | 'assistant'; content: string }) => void;
  clearChatHistory: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chatHistory: [],
  addChatMessage: (message) => set((state) => ({ chatHistory: [...state.chatHistory, message] })),
  clearChatHistory: () => set({ chatHistory: [] }),
}));
