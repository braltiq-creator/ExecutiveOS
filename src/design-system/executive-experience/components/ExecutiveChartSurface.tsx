import type { ReactNode } from "react";
import { ExecutiveEvidenceSurface } from "./ExecutiveEvidenceSurface";

type ExecutiveChartSurfaceProps = {
  label?: string;
  question: string;
  className?: string;
  children: ReactNode;
};

/** Chart/distribution host with question-led hierarchy. */
export function ExecutiveChartSurface({
  label,
  question,
  className,
  children,
}: ExecutiveChartSurfaceProps) {
  return (
    <ExecutiveEvidenceSurface
      label={label}
      question={question}
      className={className}
    >
      {children}
    </ExecutiveEvidenceSurface>
  );
}
