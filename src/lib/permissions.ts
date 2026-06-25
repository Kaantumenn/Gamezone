import type { AuthUser } from "@/types/auth";

export const CASHBOX_ACCOUNT_EDIT_ROLES = new Set([
  "ADMIN",
  "SUPERADMIN",
  "STAFF",
]);

function normalizeUserRole(role?: string | null): string {
  if (!role) return "STAFF";

  const upper = role.trim().toLocaleUpperCase("tr-TR");

  if (upper === "ADMIN" || upper === "YÖNETİCİ" || upper === "YONETICI") {
    return "ADMIN";
  }

  if (upper === "MANAGER" || upper === "MÜDÜR" || upper === "MUDUR") {
    return "MANAGER";
  }

  return upper;
}

export function isSuperAdmin(user: AuthUser | null | undefined): boolean {
  return normalizeUserRole(user?.role) === "SUPERADMIN";
}

export function canViewCashboxHistory(
  user: AuthUser | null | undefined,
): boolean {
  return isSuperAdmin(user);
}

export function canEditCashboxAccount(
  user: AuthUser | null | undefined,
): boolean {
  return CASHBOX_ACCOUNT_EDIT_ROLES.has(normalizeUserRole(user?.role));
}

export function canManageProducts(
  user: AuthUser | null | undefined,
): boolean {
  return isSuperAdmin(user);
}
