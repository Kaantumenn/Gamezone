import type { Table } from "@/types/table";
import { create } from "zustand";

interface MergeTableModalStore {
  sourceTable: Table | null;
  isOpen: boolean;
  open: (table: Table) => void;
  close: () => void;
}

export const useMergeTableModalStore = create<MergeTableModalStore>((set) => ({
  sourceTable: null,
  isOpen: false,
  open: (table) => set({ sourceTable: table, isOpen: true }),
  close: () => set({ sourceTable: null, isOpen: false }),
}));
