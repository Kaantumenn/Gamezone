"use client";

import { TableDetailPanel } from "@/components/dashboard/TableDetailPanel";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { AddOrderModal } from "@/components/modals/AddOrderModal";
import { CloseTableModal } from "@/components/modals/CloseTableModal";
import { MergeTableModal } from "@/components/modals/MergeTableModal";
import { TransferTableModal } from "@/components/modals/TransferTableModal";
import { OpenTableModal } from "@/components/modals/OpenTableModal";
import { TabFilterProvider } from "@/context/TabFilterContext";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  mainClassName?: string;
}

export function DashboardLayout({ children, mainClassName }: DashboardLayoutProps) {
  return (
    <TabFilterProvider>
      <div className="flex h-screen overflow-hidden bg-[#05050a]">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className={cn("flex-1 overflow-y-auto p-6", mainClassName)}>
            {children}
          </main>
        </div>
      </div>
      <TableDetailPanel />
      <OpenTableModal />
      <AddOrderModal />
      <CloseTableModal />
      <MergeTableModal />
      <TransferTableModal />
    </TabFilterProvider>
  );
}
