"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { createEmployee, updateEmployee } from "@/services/employees";
import type { EmployeeSummary } from "@/types/employee";
import {
  getEmptyEmployeeForm,
  type EmployeeFormValues,
} from "@/types/employee";
import { cn } from "@/lib/utils";

interface EmployeeFormModalProps {
  mode: "create" | "edit";
  employee: EmployeeSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#12121e] px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#6366f1]/50";

export function EmployeeFormModal({
  mode,
  employee,
  isOpen,
  onClose,
}: EmployeeFormModalProps) {
  const queryClient = useQueryClient();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<EmployeeFormValues>(getEmptyEmployeeForm);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (values: EmployeeFormValues) => {
      if (mode === "create") {
        return createEmployee(values);
      }
      if (!employee) throw new Error("Çalışan bulunamadı");
      return updateEmployee(employee.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      if (employee) {
        queryClient.invalidateQueries({ queryKey: ["employee", employee.id] });
      }
      onClose();
    },
    onError: () => {
      setSubmitError(
        mode === "create"
          ? "Çalışan eklenirken bir hata oluştu."
          : "Çalışan güncellenirken bir hata oluştu.",
      );
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && employee) {
      setForm({
        fullName: employee.fullName,
        phone: employee.phone ?? "",
      });
    } else {
      setForm(getEmptyEmployeeForm());
    }
    setSubmitError(null);
    document.body.style.overflow = "hidden";

    const timerId = window.setTimeout(() => nameInputRef.current?.focus(), 50);

    return () => {
      window.clearTimeout(timerId);
      document.body.style.overflow = "";
    };
  }, [isOpen, mode, employee]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !mutation.isPending) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, mutation.isPending]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      setSubmitError("Ad soyad zorunludur.");
      return;
    }
    setSubmitError(null);
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Kapat"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">
            {mode === "create" ? "Çalışan Ekle" : "Çalışanı Düzenle"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white/80"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-xs text-white/40">
              Ad Soyad
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={form.fullName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, fullName: e.target.value }))
              }
              placeholder="Örn. Kaan Tümen"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-white/40">
              Telefon (Opsiyonel)
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="05xx xxx xx xx"
              className={inputClass}
            />
          </div>

          {submitError && (
            <p className="text-sm text-rose-400">{submitError}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 rounded-xl border border-white/10 bg-[#12121e] py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#6366f1] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5558e3] disabled:opacity-50",
              )}
            >
              {mutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {mode === "create" ? "Ekle" : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
