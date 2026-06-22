import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LoginContent } from "@/components/auth/LoginContent";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#05050a]">
          <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
