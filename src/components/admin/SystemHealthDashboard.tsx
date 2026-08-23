import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HealthStatus, SystemHealthSnapshot } from "@/lib/observability/health";

type SystemHealthDashboardProps = {
  snapshot: SystemHealthSnapshot;
};

function statusVariant(status: HealthStatus) {
  if (status === "healthy") return "success" as const;
  if (status === "degraded") return "warning" as const;
  return "danger" as const;
}

function formatUptime(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export function SystemHealthDashboard({ snapshot }: SystemHealthDashboardProps) {
  const services = [
    snapshot.api,
    snapshot.database,
    snapshot.ai,
    snapshot.integrations,
    snapshot.backgroundJobs,
    snapshot.queue,
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        overline="Administration"
        title="System Health"
        description="Operational visibility for API, AI, integrations, database, and recent errors."
      />

      <ResponsiveGrid columns={4}>
        <MetricCard label="Uptime" value={formatUptime(snapshot.uptimeMs)} />
        <MetricCard
          label="Database Latency"
          value={snapshot.database.latencyMs ?? "—"}
          hint="ms"
        />
        <MetricCard label="Recent Errors" value={snapshot.recentErrors.length} />
        <MetricCard
          label="Generated"
          value={new Date(snapshot.generatedAt).toLocaleTimeString()}
        />
      </ResponsiveGrid>

      <section>
        <SectionHeader title="Service Status" />
        <ResponsiveGrid columns={3}>
          {services.map((service) => (
            <Card key={service.name} padding="md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{service.name}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-600">{service.message}</p>
                </div>
                <StatusBadge label={service.status} variant={statusVariant(service.status)} />
              </div>
            </Card>
          ))}
        </ResponsiveGrid>
      </section>

      <section>
        <SectionHeader title="Recent Errors" />
        {snapshot.recentErrors.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Time</TableHeader>
                <TableHeader>Code</TableHeader>
                <TableHeader>Message</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {snapshot.recentErrors.map((entry) => (
                <TableRow key={`${entry.timestamp}-${entry.message}`}>
                  <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{entry.code ?? "—"}</TableCell>
                  <TableCell>{entry.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Card padding="md">
            <p className="text-sm text-zinc-600">No recent errors recorded in this process.</p>
          </Card>
        )}
      </section>
    </div>
  );
}
