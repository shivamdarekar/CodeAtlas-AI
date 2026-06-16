import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IndexedRepository, RepoSummary } from '@/types';

interface RepoState {
  activeRepo: IndexedRepository | null;
  repoSummary: RepoSummary | null;
  isIndexing: boolean;

  setActiveRepo: (repo: IndexedRepository | null) => void;
  setRepoSummary: (summary: RepoSummary | null) => void;
  setIndexing: (v: boolean) => void;
  clearRepo: () => void;
}

export const useRepoStore = create<RepoState>()(
  persist(
    (set) => ({
      activeRepo: null,
      repoSummary: null,
      isIndexing: false,

      setActiveRepo: (repo) => set({ activeRepo: repo }),
      setRepoSummary: (summary) => set({ repoSummary: summary }),
      setIndexing: (v) => set({ isIndexing: v }),
      clearRepo: () => set({ activeRepo: null, repoSummary: null }),
    }),
    {
      name: 'codeatlas-repo-store',
      partialize: (state) => ({ activeRepo: state.activeRepo }), // Only persist activeRepo
    }
  )
);
