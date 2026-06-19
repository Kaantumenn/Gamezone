"use client";

import { useSearchParams } from "next/navigation";
import { ClipboardList, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTabFilter } from "@/context/TabFilterContext";

export function SiparislerContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const deviceName = searchParams.get("name");
  const { goHome } = useTabFilter();

  const hasSession = !!sessionId;

  return (
    <div className="mx-auto max-w-2xl">
      {hasSession ? (
        <div className="rounded-2xl border border-white/10 bg-[#12121e] p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366f1]/15 text-[#818cf8]">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">
                Sipariş Ekle — {deviceName ?? "Masa"}
              </h1>
              <p className="text-sm text-white/40">Oturum #{sessionId}</p>
            </div>
          </div>
          <p className="text-sm text-white/50">
            Ürün listesi ve sipariş girişi buraya bağlanacak.
          </p>
          <Link
            href="/"
            onClick={() => goHome()}
            className="mt-4 inline-flex items-center gap-2 text-sm text-[#818cf8] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Ana sayfaya dön
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#12121e] p-6 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <h1 className="text-lg font-semibold text-white">Siparişler</h1>
          <p className="mt-2 text-sm text-white/40">
            Sipariş girmek için ana sayfadan açık bir masaya tıklayın.
          </p>
          <Link
            href="/"
            onClick={() => goHome()}
            className="mt-4 inline-block text-sm text-[#818cf8] hover:text-white"
          >
            Masalara git →
          </Link>
        </div>
      )}
    </div>
  );
}
