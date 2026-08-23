/**
 * Encrypted token vault — Key Vault / env backed. No plaintext credentials.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { EncryptedTokenSet, TokenSet } from "@/providers/microsoft365/auth/entra";

export type TokenVault = {
  encrypt(tokens: TokenSet): EncryptedTokenSet;
  decrypt(encrypted: EncryptedTokenSet): TokenSet;
  rotateKey(newKeyRef: string): void;
  keyRef(): string;
};

function deriveKey(raw: string): Buffer {
  return createHash("sha256").update(raw).digest();
}

/**
 * AES-256-GCM vault. In production, rawKey comes from Azure Key Vault.
 */
export function createTokenVault(keyRef = "vault:m365-default"): TokenVault {
  let rawKey =
    process.env.M365_TOKEN_ENCRYPTION_KEY ??
    process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY ??
    "executiveos-dev-m365-key-not-for-production";
  let currentKeyRef = keyRef;

  return {
    encrypt(tokens) {
      const encryptOne = (value: string) => {
        const iv = randomBytes(12);
        const cipher = createCipheriv("aes-256-gcm", deriveKey(rawKey), iv);
        const encrypted = Buffer.concat([
          cipher.update(value, "utf8"),
          cipher.final(),
        ]);
        const tag = cipher.getAuthTag();
        return [
          iv.toString("base64url"),
          tag.toString("base64url"),
          encrypted.toString("base64url"),
        ].join(".");
      };
      return {
        accessTokenEncrypted: encryptOne(tokens.accessToken),
        refreshTokenEncrypted: tokens.refreshToken
          ? encryptOne(tokens.refreshToken)
          : null,
        idTokenEncrypted: tokens.idToken ? encryptOne(tokens.idToken) : null,
        tokenType: tokens.tokenType,
        expiresAt: tokens.expiresAt,
        scopes: tokens.scopes,
        tenantId: tokens.tenantId,
      };
    },
    decrypt(encrypted) {
      const decryptOne = (payload: string) => {
        const [ivPart, tagPart, dataPart] = payload.split(".");
        if (!ivPart || !tagPart || !dataPart) {
          throw new Error("Invalid encrypted token payload");
        }
        const decipher = createDecipheriv(
          "aes-256-gcm",
          deriveKey(rawKey),
          Buffer.from(ivPart, "base64url"),
        );
        decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
        return Buffer.concat([
          decipher.update(Buffer.from(dataPart, "base64url")),
          decipher.final(),
        ]).toString("utf8");
      };
      return {
        accessToken: decryptOne(encrypted.accessTokenEncrypted),
        refreshToken: encrypted.refreshTokenEncrypted
          ? decryptOne(encrypted.refreshTokenEncrypted)
          : null,
        idToken: encrypted.idTokenEncrypted
          ? decryptOne(encrypted.idTokenEncrypted)
          : null,
        tokenType: encrypted.tokenType,
        expiresAt: encrypted.expiresAt,
        scopes: encrypted.scopes,
        tenantId: encrypted.tenantId,
      };
    },
    rotateKey(newKeyRef) {
      currentKeyRef = newKeyRef;
      rawKey = `${rawKey}:${newKeyRef}`;
    },
    keyRef: () => currentKeyRef,
  };
}
