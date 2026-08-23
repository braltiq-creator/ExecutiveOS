import { redirect } from "next/navigation";

/** Temporary alias — Information Architecture maps dashboard → Today. */
export default function DashboardRedirectPage() {
  redirect("/today");
}
