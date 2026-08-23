import type {
  CustomerAccount,
  ProvisionedOrganisation,
  ProvisioningJob,
  QueuedEmail,
  TrialRecord,
} from "@/provisioning/types";

const accounts = new Map<string, CustomerAccount>();
const accountsByEmail = new Map<string, string>();
const organisations = new Map<string, ProvisionedOrganisation>();
const jobs = new Map<string, ProvisioningJob>();
const trials = new Map<string, TrialRecord>();
const emails: QueuedEmail[] = [];

let accountSeq = 0;
let jobSeq = 0;
let trialSeq = 0;
let emailSeq = 0;

export function resetProvisioningStore(): void {
  accounts.clear();
  accountsByEmail.clear();
  organisations.clear();
  jobs.clear();
  trials.clear();
  emails.length = 0;
  accountSeq = 0;
  jobSeq = 0;
  trialSeq = 0;
  emailSeq = 0;
}

export function nextAccountId(): string {
  accountSeq += 1;
  return `acct-${accountSeq}`;
}

export function nextJobId(): string {
  jobSeq += 1;
  return `prov-job-${jobSeq}`;
}

export function nextTrialId(): string {
  trialSeq += 1;
  return `trial-${trialSeq}`;
}

export function nextEmailId(): string {
  emailSeq += 1;
  return `email-${emailSeq}`;
}

export function saveAccount(account: CustomerAccount): CustomerAccount {
  accounts.set(account.id, account);
  accountsByEmail.set(account.email.toLowerCase(), account.id);
  return account;
}

export function getAccount(id: string): CustomerAccount | undefined {
  return accounts.get(id);
}

export function getAccountByEmail(email: string): CustomerAccount | undefined {
  const id = accountsByEmail.get(email.toLowerCase());
  return id ? accounts.get(id) : undefined;
}

export function listAccounts(): CustomerAccount[] {
  return [...accounts.values()];
}

export function saveOrganisation(
  org: ProvisionedOrganisation,
): ProvisionedOrganisation {
  organisations.set(org.id, org);
  return org;
}

export function getOrganisation(
  id: string,
): ProvisionedOrganisation | undefined {
  return organisations.get(id);
}

export function listOrganisations(): ProvisionedOrganisation[] {
  return [...organisations.values()];
}

export function saveJob(job: ProvisioningJob): ProvisioningJob {
  jobs.set(job.id, job);
  return job;
}

export function getJob(id: string): ProvisioningJob | undefined {
  return jobs.get(id);
}

export function listJobs(): ProvisioningJob[] {
  return [...jobs.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function saveTrial(trial: TrialRecord): TrialRecord {
  trials.set(trial.id, trial);
  return trial;
}

export function getTrial(id: string): TrialRecord | undefined {
  return trials.get(id);
}

export function getTrialByTenant(tenantId: string): TrialRecord | undefined {
  return [...trials.values()].find((t) => t.tenantId === tenantId);
}

export function listTrials(): TrialRecord[] {
  return [...trials.values()];
}

export function queueEmailRecord(email: QueuedEmail): QueuedEmail {
  emails.push(email);
  return email;
}

export function listQueuedEmails(): QueuedEmail[] {
  return [...emails];
}
