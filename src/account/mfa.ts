import { getMfa, setMfa } from "@/account/store";
import type { MfaStatus } from "@/account/types";

export function getMfaStatus(accountId: string): MfaStatus {
  const existing = getMfa(accountId);
  if (existing) return existing;
  return setMfa(accountId, {
    enabled: false,
    methods: [],
    enforcedForAdmins: true,
    lastVerifiedAt: null,
  });
}

export function enableMfa(
  accountId: string,
  method: "authenticator" | "sms" | "email" = "authenticator",
  asOf = new Date().toISOString(),
): MfaStatus {
  const current = getMfaStatus(accountId);
  const methods = current.methods.includes(method)
    ? current.methods
    : [...current.methods, method];
  return setMfa(accountId, {
    ...current,
    enabled: true,
    methods,
    lastVerifiedAt: asOf,
  });
}

export function disableMfa(accountId: string): MfaStatus {
  return setMfa(accountId, {
    enabled: false,
    methods: [],
    enforcedForAdmins: true,
    lastVerifiedAt: null,
  });
}
