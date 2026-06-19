import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IndexedRepository, RepoSummary } from '@/types';

interface RepoState {
  activeRepo: IndexedRepository | null;
  repoSummary: RepoSummary | null;
  isIndexing: boolean;
  repoHistory: IndexedRepository[];
  _hasHydrated: boolean;

  setActiveRepo: (repo: IndexedRepository | null) => void;
  setRepoSummary: (summary: RepoSummary | null) => void;
  setIndexing: (v: boolean) => void;
  addToHistory: (repo: IndexedRepository) => void;
  removeFromHistory: (namespace: string) => void;
  clearRepo: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useRepoStore = create<RepoState>()(
  persist(
    (set) => ({
      activeRepo: null,
      repoSummary: null,
      isIndexing: false,
      repoHistory: [],
      _hasHydrated: false,

      setActiveRepo: (repo) => set({ activeRepo: repo }),
      setRepoSummary: (summary) => set({ repoSummary: summary }),
      setIndexing: (v) => set({ isIndexing: v }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      addToHistory: (repo) =>
        set((state) => ({
          repoHistory: [
            repo,
            ...state.repoHistory.filter((r) => r.namespace !== repo.namespace),
          ].slice(0, 20),
        })),

      removeFromHistory: (namespace) =>
        set((state) => ({
          repoHistory: state.repoHistory.filter((r) => r.namespace !== namespace),
        })),

      clearRepo: () => set({ activeRepo: null, repoSummary: null, isIndexing: false }),
    }),
    {
      name: 'codeatlas-repo-store',
      partialize: (state) => ({
        activeRepo: state.activeRepo,
        repoHistory: state.repoHistory,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
