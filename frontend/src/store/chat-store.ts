import { create } from 'zustand';
import type { ChatMessage, ChatMode } from '@/types';

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  activeMode: ChatMode;

  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setStreaming: (v: boolean) => void;
  setMode: (mode: ChatMode) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  activeMode: 'chat',

  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, id: crypto.randomUUID(), timestamp: new Date() },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
  setStreaming: (v) => set({ isStreaming: v }),
  setMode: (mode) => set({ activeMode: mode }),
}));
