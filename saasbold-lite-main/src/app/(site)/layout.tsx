import { DashboardShell } from "@/components/whatsboard-dashboard/dashboard-shell";
import { WHATSBOARD_ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import { getPaymentsReconciledTodayCount } from "@/lib/whatsboard-repository";
import { resolveLegacyBusinessContextForRequest } from "@/lib/repositories/supabase-legacy-repository";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Providers } from "./providers";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(WHATSBOARD_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    redirect("/login?next=%2Fdashboard");
  }

  let businessName: string | null = null;
  let paymentsReconciledToday = 0;
  try {
    const [context, reconciledToday] = await Promise.all([
      resolveLegacyBusinessContextForRequest(),
      getPaymentsReconciledTodayCount(),
    ]);
    businessName = context.businessName;
    paymentsReconciledToday = reconciledToday;
  } catch {
    redirect("/login?force=1&next=%2Fdashboard");
  }

  return (
    <Providers>
      <DashboardShell
        workspaceName={businessName}
        paymentsReconciledToday={paymentsReconciledToday}
      >
        {children}
      </DashboardShell>
    </Providers>
  );
}
