import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";

import { Sidebar } from "./sidebar";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-white md:flex-row">
        <Sidebar />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </ToastProvider>
  );
}
