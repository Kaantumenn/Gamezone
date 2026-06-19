import type { Table } from "@/types/table";
import { create } from "zustand";

interface TransferTableModalStore {
  sourceTable: Table | null;
  isOpen: boolean;
  open: (table: Table) => void;
  close: () => void;
}

export const useTransferTableModalStore = create<TransferTableModalStore>(
  (set) => ({
    sourceTable: null,
    isOpen: false,
    open: (table) => set({ sourceTable: table, isOpen: true }),
    close: () => set({ sourceTable: null, isOpen: false }),
  }),
);
