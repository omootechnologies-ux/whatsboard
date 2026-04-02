import { DashboardShell } from "@/components/whatsboard-dashboard/dashboard-shell";
import { Providers } from "./providers";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <DashboardShell>{children}</DashboardShell>
    </Providers>
  );
}
