"use client";

import { CommandPalette } from "@/components/ui/command-palette";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { PortfolioStoreProvider } from "@/components/providers/PortfolioStoreProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <PortfolioStoreProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
          <CommandPalette />
        </PortfolioStoreProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
