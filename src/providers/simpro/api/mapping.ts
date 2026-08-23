/**
 * Canonical mapping — Simpro API shapes → BusinessEvents with executive meaning.
 * Simpro objects never leave this module's private types.
 */

import type { BusinessEvent, CanonicalEntityType } from "@/connectors/types";

/** Internal vendor shapes — not exported from public API. */
type RawJob = {
  ID: number | string;
  Name?: string;
  Stage?: string;
  Customer?: string;
  Site?: string;
  Technician?: string;
  Priority?: string;
  DateModified?: string;
};

type RawQuote = {
  ID: number | string;
  Name?: string;
  Stage?: string;
  Total?: number;
  Customer?: string;
  DateModified?: string;
};

type RawInvoice = {
  ID: number | string;
  Name?: string;
  Status?: string;
  Total?: number;
  Customer?: string;
  DueDate?: string;
};

type RawStaff = {
  ID: number | string;
  Name?: string;
  Availability?: string;
  Trade?: string;
  Reason?: string;
};

type RawPurchaseOrder = {
  ID: number | string;
  Name?: string;
  Status?: string;
  Supplier?: string;
  DateModified?: string;
};

type RawCustomer = {
  ID: number | string;
  Name?: string;
  Status?: string;
};

type RawSite = {
  ID: number | string;
  Name?: string;
  Customer?: string;
};

type RawAsset = {
  ID: number | string;
  Name?: string;
  Status?: string;
  Site?: string;
};

type RawProject = {
  ID: number | string;
  Name?: string;
  Status?: string;
  MarginPercent?: number;
  Customer?: string;
};

type RawTimesheet = {
  ID: number | string;
  Technician?: string;
  Hours?: number;
  OvertimeHours?: number;
  Date?: string;
  Job?: string | null;
  Status?: string;
};

export type CanonicalMapping = {
  executiveMeaning: string;
  eventType: string;
  entityType: CanonicalEntityType;
  importance: number;
};

function event(input: {
  id: string;
  at: string;
  entityType: CanonicalEntityType;
  entityId: string;
  eventType: string;
  importance: number;
  meaning: string;
  payload: Record<string, unknown>;
  labels?: string[];
}): BusinessEvent {
  return {
    id: input.id,
    timestamp: input.at,
    sourceSystem: "simpro",
    entityType: input.entityType,
    entityId: input.entityId,
    eventType: input.eventType,
    importance: input.importance,
    confidence: 84,
    relationships: [],
    payload: {
      executiveMeaning: input.meaning,
      ...input.payload,
    },
    metadata: {
      connectorId: "provider-simpro",
      labels: ["field-service", "operational-context", ...(input.labels ?? [])],
    },
  };
}

export function mapJobsToEvents(jobs: RawJob[], asOf: string): BusinessEvent[] {
  const events: BusinessEvent[] = [];
  for (const job of jobs) {
    const id = String(job.ID);
    const stage = (job.Stage ?? "").toLowerCase();
    const critical = /critical|emergency/i.test(job.Priority ?? "") ||
      /critical|emergency/i.test(job.Name ?? "");

    if (stage.includes("schedul")) {
      events.push(
        event({
          id: `evt-op-job-sched-${id}`,
          at: job.DateModified ?? asOf,
          entityType: "Action",
          entityId: `job-${id}`,
          eventType: "status_changed",
          importance: critical ? 88 : 70,
          meaning: "Operational Capacity Allocated",
          payload: {
            title: job.Name ?? `Job ${id}`,
            customer: job.Customer,
            site: job.Site,
            technician: job.Technician,
          },
          labels: ["job", "scheduling"],
        }),
      );
    }
    if (job.Technician) {
      events.push(
        event({
          id: `evt-op-tech-assign-${id}`,
          at: job.DateModified ?? asOf,
          entityType: "Person",
          entityId: `tech-${job.Technician.replace(/\s+/g, "-").toLowerCase()}`,
          eventType: "relationship_asserted",
          importance: 65,
          meaning: "Resource Allocation Updated",
          payload: {
            title: job.Name ?? `Job ${id}`,
            technician: job.Technician,
          },
          labels: ["technician", "assignment"],
        }),
      );
    }
    if (stage.includes("complete")) {
      events.push(
        event({
          id: `evt-op-job-done-${id}`,
          at: job.DateModified ?? asOf,
          entityType: "Action",
          entityId: `job-${id}`,
          eventType: "status_changed",
          importance: 55,
          meaning: "Service Delivered",
          payload: { title: job.Name ?? `Job ${id}` },
          labels: ["job", "delivery"],
        }),
      );
    }
    if (stage.includes("delay") || stage.includes("hold")) {
      events.push(
        event({
          id: `evt-op-job-delay-${id}`,
          at: job.DateModified ?? asOf,
          entityType: "Risk",
          entityId: `job-delay-${id}`,
          eventType: "risk_raised",
          importance: 84,
          meaning: "Customer Delivery Risk Increased",
          payload: {
            title: job.Name ?? `Job ${id}`,
            customer: job.Customer,
            reason: "Job delayed",
          },
          labels: ["job", "delayed"],
        }),
      );
    }
    if (/complaint|escalat/i.test(job.Name ?? "")) {
      events.push(
        event({
          id: `evt-op-job-complaint-${id}`,
          at: job.DateModified ?? asOf,
          entityType: "Risk",
          entityId: `job-complaint-${id}`,
          eventType: "risk_raised",
          importance: 86,
          meaning: "Customer Satisfaction Risk Increased",
          payload: {
            title: job.Name ?? `Job ${id}`,
            customer: job.Customer,
          },
          labels: ["job", "complaint"],
        }),
      );
    }
    if (/safety|incident|hazard/i.test(job.Name ?? "")) {
      events.push(
        event({
          id: `evt-op-job-safety-${id}`,
          at: job.DateModified ?? asOf,
          entityType: "Risk",
          entityId: `job-safety-${id}`,
          eventType: "risk_raised",
          importance: 95,
          meaning: "Safety Risk Increased",
          payload: {
            title: job.Name ?? `Job ${id}`,
            customer: job.Customer,
          },
          labels: ["job", "safety"],
        }),
      );
    }
    if (critical && !stage.includes("complete")) {
      events.push(
        event({
          id: `evt-op-job-risk-${id}`,
          at: job.DateModified ?? asOf,
          entityType: "Risk",
          entityId: `job-risk-${id}`,
          eventType: "risk_raised",
          importance: 90,
          meaning: "Customer Delivery Risk Increased",
          payload: {
            title: job.Name ?? `Job ${id}`,
            customer: job.Customer,
          },
          labels: ["job", "delivery-risk"],
        }),
      );
    }
  }
  return events;
}

export function mapQuotesToEvents(
  quotes: RawQuote[],
  asOf: string,
): BusinessEvent[] {
  return quotes.map((quote) => {
    const accepted = /accept/i.test(quote.Stage ?? "");
    return event({
      id: `evt-op-quote-${quote.ID}`,
      at: quote.DateModified ?? asOf,
      entityType: "Opportunity",
      entityId: `quote-${quote.ID}`,
      eventType: accepted ? "opportunity_moved" : "entity_upserted",
      importance: accepted ? 82 : 60,
      meaning: accepted
        ? "Revenue Opportunity Increased"
        : "Revenue Pipeline Updated",
      payload: {
        title: quote.Name ?? `Quote ${quote.ID}`,
        amount: quote.Total ?? 0,
        customer: quote.Customer,
        stage: quote.Stage,
      },
      labels: ["quote", "revenue"],
    });
  });
}

export function mapInvoicesToEvents(
  invoices: RawInvoice[],
  asOf: string,
): BusinessEvent[] {
  return invoices.map((invoice) => {
    const overdue = /overdue/i.test(invoice.Status ?? "");
    return event({
      id: `evt-op-inv-${invoice.ID}`,
      at: asOf,
      entityType: overdue ? "Risk" : "Metric",
      entityId: `invoice-${invoice.ID}`,
      eventType: overdue ? "risk_raised" : "entity_upserted",
      importance: overdue ? 86 : 50,
      meaning: overdue
        ? "Cash Collection Risk Increased"
        : "Invoice Position Updated",
      payload: {
        title: invoice.Name ?? `Invoice ${invoice.ID}`,
        amount: invoice.Total ?? 0,
        customer: invoice.Customer,
        dueDate: invoice.DueDate,
        status: invoice.Status,
      },
      labels: ["invoice", "cash"],
    });
  });
}

export function mapStaffToEvents(
  staff: RawStaff[],
  asOf: string,
): BusinessEvent[] {
  return staff.map((person) => {
    const unavailable = /unavail|sick|leave/i.test(person.Availability ?? "") ||
      /sick/i.test(person.Reason ?? "");
    return event({
      id: `evt-op-staff-${person.ID}`,
      at: asOf,
      entityType: "Person",
      entityId: `tech-${person.ID}`,
      eventType: unavailable ? "signal_emitted" : "entity_upserted",
      importance: unavailable ? 90 : 45,
      meaning: unavailable
        ? "Operational Capacity Reduced"
        : "Technician Availability Updated",
      payload: {
        name: person.Name ?? `Technician ${person.ID}`,
        trade: person.Trade,
        availability: person.Availability,
        reason: person.Reason,
      },
      labels: ["technician", "capacity"],
    });
  });
}

export function mapPurchaseOrdersToEvents(
  orders: RawPurchaseOrder[],
  asOf: string,
): BusinessEvent[] {
  return orders.map((po) => {
    const delayed = /delay|hold|backorder/i.test(po.Status ?? "");
    return event({
      id: `evt-op-po-${po.ID}`,
      at: po.DateModified ?? asOf,
      entityType: delayed ? "Risk" : "System",
      entityId: `po-${po.ID}`,
      eventType: delayed ? "risk_raised" : "entity_upserted",
      importance: delayed ? 78 : 50,
      meaning: delayed
        ? "Supply Chain Risk Increased"
        : "Purchase Order Updated",
      payload: {
        title: po.Name ?? `PO ${po.ID}`,
        supplier: po.Supplier,
        status: po.Status,
      },
      labels: ["purchase-order", "supply"],
    });
  });
}

export function mapCustomersToEvents(
  customers: RawCustomer[],
  asOf: string,
): BusinessEvent[] {
  return customers.map((customer) =>
    event({
      id: `evt-op-cust-${customer.ID}`,
      at: asOf,
      entityType: "Customer",
      entityId: `customer-${customer.ID}`,
      eventType: "entity_upserted",
      importance: 40,
      meaning: "Customer Relationship Updated",
      payload: {
        name: customer.Name ?? `Customer ${customer.ID}`,
        status: customer.Status,
      },
      labels: ["customer"],
    }),
  );
}

export function mapSitesToEvents(sites: RawSite[], asOf: string): BusinessEvent[] {
  return sites.map((site) =>
    event({
      id: `evt-op-site-${site.ID}`,
      at: asOf,
      entityType: "System",
      entityId: `site-${site.ID}`,
      eventType: "entity_upserted",
      importance: 35,
      meaning: "Operating Site Updated",
      payload: {
        name: site.Name ?? `Site ${site.ID}`,
        customer: site.Customer,
      },
      labels: ["site"],
    }),
  );
}

export function mapAssetsToEvents(
  assets: RawAsset[],
  asOf: string,
): BusinessEvent[] {
  return assets.map((asset) => {
    const unavailable = /down|offline|fault/i.test(asset.Status ?? "");
    return event({
      id: `evt-op-asset-${asset.ID}`,
      at: asOf,
      entityType: "System",
      entityId: `asset-${asset.ID}`,
      eventType: unavailable ? "risk_raised" : "entity_upserted",
      importance: unavailable ? 75 : 40,
      meaning: unavailable
        ? "Operational Risk Increased"
        : "Asset Position Updated",
      payload: {
        name: asset.Name ?? `Asset ${asset.ID}`,
        status: asset.Status,
        site: asset.Site,
      },
      labels: ["asset"],
    });
  });
}

export function mapProjectsToEvents(
  projects: RawProject[],
  asOf: string,
): BusinessEvent[] {
  return projects.map((project) => {
    const marginRisk =
      typeof project.MarginPercent === "number" && project.MarginPercent < 12;
    return event({
      id: `evt-op-proj-${project.ID}`,
      at: asOf,
      entityType: marginRisk ? "Risk" : "Project",
      entityId: `project-${project.ID}`,
      eventType: marginRisk ? "risk_raised" : "entity_upserted",
      importance: marginRisk ? 80 : 55,
      meaning: marginRisk ? "Margin Risk Increased" : "Project Health Updated",
      payload: {
        name: project.Name ?? `Project ${project.ID}`,
        status: project.Status,
        marginPercent: project.MarginPercent,
        customer: project.Customer,
      },
      labels: ["project"],
    });
  });
}

export function mapTimesheetsToEvents(
  timesheets: RawTimesheet[],
  asOf: string,
): BusinessEvent[] {
  return timesheets.map((row) => {
    const overtime = Number(row.OvertimeHours ?? 0) > 0;
    return event({
      id: `evt-op-ts-${row.ID}`,
      at: asOf,
      entityType: overtime ? "Signal" : "Metric",
      entityId: `timesheet-${row.ID}`,
      eventType: "signal_emitted",
      importance: overtime ? 70 : 40,
      meaning: overtime
        ? "Field Productivity Pressure Increased"
        : "Field Productivity Updated",
      payload: {
        technician: row.Technician,
        hours: row.Hours ?? 0,
        overtimeHours: row.OvertimeHours ?? 0,
        job: row.Job,
      },
      labels: ["timesheet", "productivity"],
    });
  });
}

/** Large-tenant simulation for tests. */
export function simulateLargeCustomerPortfolio(input: {
  customers: number;
  jobsPerCustomer: number;
  asOf: string;
}): BusinessEvent[] {
  const events: BusinessEvent[] = [];
  for (let c = 0; c < input.customers; c += 1) {
    events.push(
      ...mapCustomersToEvents(
        [{ ID: c + 1, Name: `Customer ${c + 1}`, Status: "Active" }],
        input.asOf,
      ),
    );
    for (let j = 0; j < input.jobsPerCustomer; j += 1) {
      events.push(
        ...mapJobsToEvents(
          [
            {
              ID: c * 1000 + j,
              Name: `Service job ${c}-${j}`,
              Stage: "Scheduled",
              Customer: `Customer ${c + 1}`,
              DateModified: input.asOf,
            },
          ],
          input.asOf,
        ),
      );
    }
  }
  return events;
}
