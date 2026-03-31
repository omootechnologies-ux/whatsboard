import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardWriteAccess } from "@/lib/dashboard-access";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, business, isAdmin, canCreateOrders } = await getDashboardWriteAccess();

  return (
    <DashboardShell
      isAdmin={isAdmin}
      profile={profile}
      business={business}
      canCreateOrders={canCreateOrders}
    >
      {children}
    </DashboardShell>
  );
}
