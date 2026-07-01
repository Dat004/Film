import { create } from "zustand";

interface PreviewPosition {
  x: number;
  y: number;
}

interface PreviewState {
  isShowPreview: boolean;
  currentPreviewData: any;
  listPreviewData: any[];
  position: PreviewPosition;

  // Actions
  setShowPreview: (show: boolean) => void;
  setCurrentPreviewData: (data: any) => void;
  setPosition: (pos: PreviewPosition) => void;
  setListPreviewData: (data: any) => void;
  reset: () => void;
}

export const usePreviewStore = create<PreviewState>((set) => ({
  isShowPreview: false,
  currentPreviewData: {},
  listPreviewData: [],
  position: { x: 0, y: 0 },

  setShowPreview: (isShowPreview) => set({ isShowPreview }),
  
  setCurrentPreviewData: (currentPreviewData) => 
    set({ currentPreviewData: { ...currentPreviewData } }),
  
  setPosition: (position) => set({ position }),
  
  setListPreviewData: (data) =>
    set((state) => {
      const exists = state.listPreviewData.some((item) => item._id === data?._id);
      if (exists) return {};
      return {
        listPreviewData: [...state.listPreviewData, data],
      };
    }),

  reset: () =>
    set({
      isShowPreview: false,
      currentPreviewData: {},
      listPreviewData: [],
      position: { x: 0, y: 0 },
    }),
}));
