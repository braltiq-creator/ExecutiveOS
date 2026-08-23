import { requireAppAccess } from "@/lib/auth/access";
import { loadInitiativesPageData } from "@/lib/initiatives/actions";
import { AppShell } from "@/components/layout/AppShell";
import { InitiativeBoard } from "@/components/initiatives/InitiativeBoard";

export default async function InitiativesPage() {
  await requireAppAccess();
  const { initiatives, linkCatalog } = await loadInitiativesPageData();

  return (
    <AppShell breadcrumb="Initiatives">
      <InitiativeBoard
        initialInitiatives={initiatives}
        linkCatalog={linkCatalog}
      />
    </AppShell>
  );
}
