import { redirect } from "next/navigation";

/** Temporary alias — Information Architecture maps graph → Knowledge. */
export default function GraphRedirectPage() {
  redirect("/knowledge");
}
