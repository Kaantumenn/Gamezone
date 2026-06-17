import type { Table } from "@/types/table";
import { create } from "zustand";

interface CloseTableModalStore {
  table: Table | null;
  isOpen: boolean;
  open: (table: Table) => void;
  close: () => void;
}

export const useCloseTableModalStore = create<CloseTableModalStore>((set) => ({
  table: null,
  isOpen: false,
  open: (table) => set({ table, isOpen: true }),
  close: () => set({ table: null, isOpen: false }),
}));
