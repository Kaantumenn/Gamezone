import { create } from "zustand";
import type { EmployeeSummary } from "@/types/employee";

interface EmployeeOrderModalStore {
  employee: EmployeeSummary | null;
  isOpen: boolean;
  open: (employee: EmployeeSummary) => void;
  close: () => void;
}

export const useEmployeeOrderModalStore = create<EmployeeOrderModalStore>(
  (set) => ({
    employee: null,
    isOpen: false,
    open: (employee) => set({ employee, isOpen: true }),
    close: () => set({ isOpen: false, employee: null }),
  }),
);
