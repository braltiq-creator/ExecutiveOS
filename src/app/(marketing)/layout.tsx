import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import { MarketingShell } from "@/components/marketing/MarketingShell";

const display = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-mk-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ExecutiveOS — The operating system for executive decision making",
    template: "%s · ExecutiveOS",
  },
  description:
    "Executive Intelligence Platform. Know what requires your attention — and why — before your first meeting. Confidence Through Clarity.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={display.variable}>
      <MarketingShell>{children}</MarketingShell>
    </div>
  );
}
