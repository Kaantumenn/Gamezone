import type { Table } from "@/types/table";
import { create } from "zustand";

interface AddOrderModalStore {
  table: Table | null;
  isOpen: boolean;
  open: (table: Table) => void;
  close: () => void;
}

export const useAddOrderModalStore = create<AddOrderModalStore>((set) => ({
  table: null,
  isOpen: false,
  open: (table) => set({ table, isOpen: true }),
  close: () => set({ table: null, isOpen: false }),
}));
