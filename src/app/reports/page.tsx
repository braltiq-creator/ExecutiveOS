import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { ReportsFoundation } from "@/features/reports/ReportsFoundation";

export default async function ReportsPage() {
  await requireAppAccess({ requireOnboarding: false });

  return (
    <AppFrame title="Reports" density="snapshot">
      <ReportsFoundation />
    </AppFrame>
  );
}
