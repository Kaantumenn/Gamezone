import { create } from "zustand";

interface EmployeeDetailPanelStore {
  selectedEmployeeId: number | null;
  open: (employeeId: number) => void;
  select: (employeeId: number) => void;
  close: () => void;
}

export const useEmployeeDetailPanelStore = create<EmployeeDetailPanelStore>(
  (set) => ({
    selectedEmployeeId: null,
    open: (employeeId) =>
      set((state) => ({
        selectedEmployeeId:
          state.selectedEmployeeId === employeeId ? null : employeeId,
      })),
    select: (employeeId) => set({ selectedEmployeeId: employeeId }),
    close: () => set({ selectedEmployeeId: null }),
  }),
);
