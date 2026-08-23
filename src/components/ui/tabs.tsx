"use client";

import { cn } from "@/lib/utils/cn";
import { focusRing } from "@/components/ui/styles";

type TabsProps = {
  tabs: Array<{ id: string; label: string; count?: number }>;
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  ariaLabel?: string;
};

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  ariaLabel = "Tabs",
}: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("flex flex-wrap gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1", className)}
    >
      {tabs.map((tab) => {
        const selected = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              selected
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900",
              focusRing,
            )}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span className="ml-1 text-zinc-400">({tab.count})</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  id,
  labelledBy,
  children,
  hidden,
}: {
  id: string;
  labelledBy: string;
  children: React.ReactNode;
  hidden?: boolean;
}) {
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={labelledBy}
      hidden={hidden}
      className={hidden ? "hidden" : "mt-4"}
    >
      {children}
    </div>
  );
}
