"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { provisionDesignPartnerAction } from "@/pilot/actions";
import type { IntelligenceProfileId } from "@/profiles";

export function PilotProvisionForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [industry, setIndustry] = useState("Field Services");
  const [profileId, setProfileId] =
    useState<IntelligenceProfileId>("operations_executive");
  const [adminEmail, setAdminEmail] = useState("cs@braltiq.com");

  return (
    <Card padding="md">
      <SectionHeader
        title="One-click provision"
        description="Create a Design Partner tenant from the profile template."
      />
      <form
        className="mt-4 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const result = await provisionDesignPartnerAction({
              partnerName,
              industry,
              intelligenceProfileId: profileId,
              administratorEmail: adminEmail,
            });
            setMessage(result.message);
            if (result.ok) {
              setPartnerName("");
              router.refresh();
            }
          });
        }}
      >
        <label className="block text-sm">
          <span className="text-[var(--eos-text-secondary)]">Tenant name</span>
          <input
            className="mt-1 w-full rounded border border-[var(--eos-border)] bg-[var(--eos-surface)] px-3 py-2 text-[var(--eos-text)]"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            required
            placeholder="Harbour Field"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--eos-text-secondary)]">Industry</span>
          <input
            className="mt-1 w-full rounded border border-[var(--eos-border)] bg-[var(--eos-surface)] px-3 py-2 text-[var(--eos-text)]"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--eos-text-secondary)]">
            Intelligence profile
          </span>
          <select
            className="mt-1 w-full rounded border border-[var(--eos-border)] bg-[var(--eos-surface)] px-3 py-2 text-[var(--eos-text)]"
            value={profileId}
            onChange={(e) =>
              setProfileId(e.target.value as IntelligenceProfileId)
            }
          >
            <option value="operations_executive">Operations Executive</option>
            <option value="commercial_executive">Commercial Executive</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-[var(--eos-text-secondary)]">Administrator</span>
          <input
            type="email"
            className="mt-1 w-full rounded border border-[var(--eos-border)] bg-[var(--eos-surface)] px-3 py-2 text-[var(--eos-text)]"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
          />
        </label>
        <div className="sm:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-[var(--eos-text)] px-4 py-2 text-sm font-medium text-[var(--eos-surface)] disabled:opacity-50"
          >
            {pending ? "Provisioning…" : "Provision Design Partner"}
          </button>
          {message ? (
            <p className="text-sm text-[var(--eos-text-secondary)]">{message}</p>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
