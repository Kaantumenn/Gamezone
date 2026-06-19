"use client";

import { useState } from "react";
import { Briefcase, Loader2, Plus } from "lucide-react";
import { EmployeeCard } from "@/components/employees/EmployeeCard";
import { EmployeeDetailPanel } from "@/components/employees/EmployeeDetailPanel";
import { EmployeeFormModal } from "@/components/modals/EmployeeFormModal";
import { EmployeeOrderModal } from "@/components/modals/EmployeeOrderModal";
import { useEmployees } from "@/hooks/useEmployees";

export function EmployeesContent() {
  const { data: employees = [], isLoading, isError, refetch } = useEmployees();
  const [formOpen, setFormOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-white/50">
        <p>Çalışanlar yüklenemedi.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm text-white hover:bg-[#5558e3]"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Çalışanlar</h1>
            <p className="mt-1 text-sm text-white/40">
              Çalışanlara kendi hesaplarına sipariş ekleyebilirsiniz.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6366f1] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-colors hover:bg-[#5558e3]"
          >
            <Plus className="h-4 w-4" />
            Çalışan Ekle
          </button>
        </div>

        <section>
          <div className="mb-4 flex items-center gap-2.5">
            <Briefcase className="h-4 w-4 text-[#818cf8]" />
            <h2 className="text-xs font-bold tracking-[0.15em] text-white/50">
              ÇALIŞAN LİSTESİ
            </h2>
          </div>

          {employees.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#12121e]/40 px-6 py-16 text-center">
              <p className="text-sm text-white/35">Henüz çalışan eklenmemiş.</p>
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#6366f1]/40 px-4 py-2 text-sm font-medium text-[#a5b4fc] transition-colors hover:bg-[#6366f1]/10"
              >
                <Plus className="h-4 w-4" />
                İlk çalışanı ekle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {employees.map((employee) => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))}
            </div>
          )}
        </section>
      </div>

      <EmployeeDetailPanel />
      <EmployeeOrderModal />
      <EmployeeFormModal
        mode="create"
        employee={null}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </>
  );
}
