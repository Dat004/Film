import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_RECENT_SEARCHES = 10;

export interface RecentSearchState {
  searches: string[];
  addSearch: (keyword: string) => void;
  removeSearch: (keyword: string) => void;
  clearAll: () => void;
}

export const useRecentSearchStore = create<RecentSearchState>()(
  persist(
    (set) => ({
      searches: [],

      addSearch: (keyword: string) => {
        const trimmed = keyword.trim();
        if (!trimmed) return;

        set((state) => {
          // Dedup: remove if already exists, then prepend (LIFO)
          const filtered = state.searches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
          return {
            searches: [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES),
          };
        });
      },

      removeSearch: (keyword: string) =>
        set((state) => ({
          searches: state.searches.filter((s) => s.toLowerCase() !== keyword.toLowerCase()),
        })),

      clearAll: () => set({ searches: [] }),
    }),
    {
      name: 'film-recent-searches',
      partialize: (state) => ({ searches: state.searches }),
    }
  )
);
