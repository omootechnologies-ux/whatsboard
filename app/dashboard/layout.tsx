import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireDashboardAccess } from "@/lib/dashboard-access";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, business, isAdmin } = await requireDashboardAccess();

  return (
    <DashboardShell
      isAdmin={isAdmin}
      profile={profile}
      business={business}
    >
      {children}
    </DashboardShell>
  );
}
