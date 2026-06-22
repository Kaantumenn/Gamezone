"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { extractAuthToken, getLoginErrorMessage } from "@/lib/auth";
import { login } from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

  const { token, isHydrated, hydrate, setAuth } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isHydrated && token) {
      router.replace(nextPath);
    }
  }, [isHydrated, token, nextPath, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setError("Kullanıcı adı ve şifre zorunludur.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({
        username: trimmedUsername,
        password,
      });

      const authToken = extractAuthToken(response);
      if (!authToken) {
        setError("Sunucudan geçerli bir oturum bilgisi alınamadı.");
        return;
      }

      setAuth(authToken, response.user ?? null);
      router.replace(nextPath);
    } catch (submitError) {
      setError(getLoginErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated || token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05050a]">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05050a] px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#6366f1]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-[#3b82f6]/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/gamezone_logo.png"
            alt="Gamezone"
            width={960}
            height={320}
            priority
            className="h-28 w-auto object-contain sm:h-32"
          />
          <h1 className="mt-6 text-2xl font-semibold text-white">
            Yönetim Paneli
          </h1>
          <p className="mt-2 text-sm text-white/45">
            Devam etmek için hesabınıza giriş yapın.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#080810]/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm text-white/50"
              >
                Kullanıcı Adı
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-white/10 bg-[#12121e] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#6366f1]/50 disabled:opacity-60"
                placeholder="Kullanıcı adınızı girin"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm text-white/50"
              >
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/10 bg-[#12121e] px-4 py-3 pr-12 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#6366f1]/50 disabled:opacity-60"
                  placeholder="Şifrenizi girin"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/35 transition-colors hover:text-white/70"
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl bg-[#6366f1] py-3.5 text-sm font-semibold text-white transition-colors",
                "hover:bg-[#5558e3] disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
