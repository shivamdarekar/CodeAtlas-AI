import { create } from 'zustand';

interface RepoState {
  activeRepoId: string | null;
  setActiveRepoId: (id: string | null) => void;
}

export const useRepoStore = create<RepoState>((set) => ({
  activeRepoId: null,
  setActiveRepoId: (id) => set({ activeRepoId: id }),
}));
