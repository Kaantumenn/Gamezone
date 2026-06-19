import { create } from "zustand";

interface TableDetailPanelStore {
  selectedDeviceId: number | null;
  open: (deviceId: number) => void;
  select: (deviceId: number) => void;
  close: () => void;
}

export const useTableDetailPanelStore = create<TableDetailPanelStore>((set) => ({
  selectedDeviceId: null,
  open: (deviceId) =>
    set((state) => ({
      selectedDeviceId:
        state.selectedDeviceId === deviceId ? null : deviceId,
    })),
  select: (deviceId) => set({ selectedDeviceId: deviceId }),
  close: () => set({ selectedDeviceId: null }),
}));
