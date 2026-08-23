import { AppShell } from "@/components/layout/AppShell";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { requireAppSession } from "@/services/session";

type AppFrameProps = {
  children: React.ReactNode;
  breadcrumb?: string;
  title?: string;
  density?: "default" | "snapshot" | "mission";
};

/** Server frame: mock/real session + application shell. */
export async function AppFrame({
  children,
  breadcrumb,
  title,
  density = "default",
}: AppFrameProps) {
  const session = await requireAppSession();

  return (
    <SessionProvider session={session}>
      <AppShell breadcrumb={breadcrumb} title={title} density={density}>
        {children}
      </AppShell>
    </SessionProvider>
  );
}
