import { Suspense } from "react";
import { SiparislerContent } from "./SiparislerContent";

export default function SiparislerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-white/40">
          Yükleniyor...
        </div>
      }
    >
      <SiparislerContent />
    </Suspense>
  );
}
