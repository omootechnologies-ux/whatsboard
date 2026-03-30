import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getViewerContext } from "@/lib/queries";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, business, isAdmin } = await getViewerContext();

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
