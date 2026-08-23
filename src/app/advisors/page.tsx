import { redirect } from "next/navigation";

/** Temporary alias — Information Architecture maps advisors → Insights. */
export default function AdvisorsRedirectPage() {
  redirect("/insights");
}
