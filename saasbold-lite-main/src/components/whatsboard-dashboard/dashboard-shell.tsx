import { DashboardShellFrame } from "./dashboard-ui";

export function DashboardShell({
  children,
  workspaceName,
  paymentsReconciledToday,
}: {
  children: React.ReactNode;
  workspaceName?: string | null;
  paymentsReconciledToday?: number;
}) {
  return (
    <DashboardShellFrame
      workspaceName={workspaceName}
      paymentsReconciledToday={paymentsReconciledToday}
    >
      {children}
    </DashboardShellFrame>
  );
}
