import type { ReactNode } from "react";
import { AppFrame } from "@/components/layout/AppFrame";
import { ExperiencePage } from "@/experience/layouts/ExperiencePage";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import { PortalNav } from "@/components/organisation-portal/PortalNav";

export function PortalShell({
  title,
  eyebrow = "Organisation Portal",
  description,
  children,
}: {
  title: string;
  eyebrow?: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <AppFrame title={title} density="snapshot">
      <ExperiencePage width="wide" className="space-y-8 pb-16">
        <header className="space-y-3 pt-2">
          <ExperienceBadge tone="accent">{eyebrow}</ExperienceBadge>
          <h1 className="ex-display">{title}</h1>
          <p className="ex-body max-w-2xl">{description}</p>
        </header>
        <PortalNav />
        <div className="space-y-6">{children}</div>
      </ExperiencePage>
    </AppFrame>
  );
}
