/**
 * Customer identity — account creation for self-service trial.
 */

import {
  getAccount,
  getAccountByEmail,
  nextAccountId,
  saveAccount,
} from "@/provisioning/store";
import type { CustomerAccount } from "@/provisioning/types";

function hashPassword(password: string): string {
  // Mock hash — not for production crypto; identity layer only.
  let h = 0;
  for (let i = 0; i < password.length; i += 1) {
    h = (h * 33 + password.charCodeAt(i)) >>> 0;
  }
  return `mock$${h.toString(16)}`;
}

export function createCustomerAccount(input: {
  name: string;
  email: string;
  password: string;
  company: string;
  asOf?: string;
}): { ok: true; account: CustomerAccount } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) {
    return { ok: false, error: "Valid email required" };
  }
  if (input.password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }
  if (getAccountByEmail(email)) {
    return { ok: false, error: "An account already exists for this email" };
  }
  const account: CustomerAccount = {
    id: nextAccountId(),
    name: input.name.trim(),
    email,
    passwordHash: hashPassword(input.password),
    company: input.company.trim(),
    emailVerified: false,
    createdAt: input.asOf ?? new Date().toISOString(),
  };
  saveAccount(account);
  return { ok: true, account };
}

export function verifyCustomerEmail(
  accountId: string,
): CustomerAccount | undefined {
  const existing = getAccount(accountId);
  if (!existing) return undefined;
  return saveAccount({ ...existing, emailVerified: true });
}

export function authenticateCustomer(input: {
  email: string;
  password: string;
}): CustomerAccount | null {
  const account = getAccountByEmail(input.email.trim().toLowerCase());
  if (!account) return null;
  if (account.passwordHash !== hashPassword(input.password)) return null;
  return account;
}
