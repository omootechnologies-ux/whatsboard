import { DashboardShellFrame } from "./dashboard-ui";

export function DashboardShell({
  children,
  workspaceName,
}: {
  children: React.ReactNode;
  workspaceName?: string | null;
}) {
  return (
    <DashboardShellFrame workspaceName={workspaceName}>
      {children}
    </DashboardShellFrame>
  );
}
