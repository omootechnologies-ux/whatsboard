import { DashboardShellFrame } from "./dashboard-ui";

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShellFrame>{children}</DashboardShellFrame>;
}
