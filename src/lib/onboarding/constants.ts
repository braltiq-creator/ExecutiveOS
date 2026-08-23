export const BUSINESS_SYSTEMS = [
  "Microsoft 365",
  "Google Workspace",
  "Salesforce",
  "HubSpot",
  "SAP",
  "Oracle",
  "Jira",
  "Confluence",
  "Slack",
  "Microsoft Teams",
  "Notion",
  "Monday.com",
  "Asana",
] as const;

export type BusinessSystem = (typeof BUSINESS_SYSTEMS)[number];

export const INDUSTRIES = [
  "Technology",
  "Financial Services",
  "Healthcare",
  "Manufacturing",
  "Retail & Consumer",
  "Professional Services",
  "Energy & Utilities",
  "Real Estate",
  "Media & Entertainment",
  "Education",
  "Government",
  "Non-Profit",
  "Other",
] as const;

export const COUNTRIES = [
  "Australia",
  "Canada",
  "France",
  "Germany",
  "India",
  "Japan",
  "Netherlands",
  "New Zealand",
  "Singapore",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Other",
] as const;

export const TIMEZONES = [
  "Pacific/Auckland",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Brisbane",
  "Australia/Perth",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "UTC",
] as const;

export const COMPANY_SIZES = [
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–500 employees",
  "501–1,000 employees",
  "1,001–5,000 employees",
  "5,001–10,000 employees",
  "10,000+ employees",
] as const;

export const REVENUE_BANDS = [
  "Under $1M",
  "$1M – $10M",
  "$10M – $50M",
  "$50M – $100M",
  "$100M – $500M",
  "$500M – $1B",
  "$1B – $5B",
  "$5B+",
  "Prefer not to say",
] as const;

export const OBJECTIVE_PRIORITIES = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;
