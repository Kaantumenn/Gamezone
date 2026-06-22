import type { LoginResponse } from "@/types/auth";

export function extractAuthToken(response: LoginResponse): string | null {
  return response.token ?? response.accessToken ?? response.access_token ?? null;
}

export function getLoginErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data;

    if (typeof data === "object" && data !== null) {
      if ("message" in data && typeof data.message === "string") {
        return data.message;
      }

      if ("error" in data && typeof data.error === "string") {
        return data.error;
      }
    }
  }

  return "Giriş yapılamadı. Kullanıcı adı veya şifreyi kontrol edin.";
}
