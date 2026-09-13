import { create } from "zustand";
import type { ChatModel } from "@/types";

export type WorkspaceTab = "sources" | "chat" | "artifacts";

interface UIState {
  // Mobile / layout sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Global modals
  activeModal: string | null;
  modalData: unknown;
  openModal: (modal: string, data?: unknown) => void;
  closeModal: () => void;

  // Active workspace tab
  activeWorkspaceTab: WorkspaceTab;
  setActiveWorkspaceTab: (tab: WorkspaceTab) => void;

  // Source selection for bulk actions or artifact generation
  selectedSourceIds: string[];
  toggleSourceSelection: (id: string) => void;
  selectAllSources: (ids: string[]) => void;
  clearSourceSelection: () => void;

  // Chat preferences
  chatWebSearchEnabled: boolean;
  setChatWebSearchEnabled: (enabled: boolean) => void;
  chatSelectedModel: ChatModel;
  setChatSelectedModel: (model: ChatModel) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  activeModal: null,
  modalData: null,
  openModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  activeWorkspaceTab: "chat",
  setActiveWorkspaceTab: (tab) => set({ activeWorkspaceTab: tab }),

  selectedSourceIds: [],
  toggleSourceSelection: (id) =>
    set((state) => ({
      selectedSourceIds: state.selectedSourceIds.includes(id)
        ? state.selectedSourceIds.filter((item) => item !== id)
        : [...state.selectedSourceIds, id],
    })),
  selectAllSources: (ids) => set({ selectedSourceIds: ids }),
  clearSourceSelection: () => set({ selectedSourceIds: [] }),

  chatWebSearchEnabled: false,
  setChatWebSearchEnabled: (enabled) => set({ chatWebSearchEnabled: enabled }),
  chatSelectedModel: "gpt-4o-mini",
  setChatSelectedModel: (model) => set({ chatSelectedModel: model }),
}));
