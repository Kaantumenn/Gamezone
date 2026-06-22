"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, isHydrated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated || token) return;
    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [isHydrated, token, pathname, router]);

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#05050a]">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#05050a]">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
      </div>
    );
  }

  return children;
}
