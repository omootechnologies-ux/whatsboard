import { DashboardShell } from "@/components/whatsboard-dashboard/dashboard-shell";
import { WHATSBOARD_ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import { getPaymentsReconciledTodayCount } from "@/lib/whatsboard-repository";
import {
  provisionLegacyBusinessForAccessToken,
  resolveLegacyBusinessContextForRequest,
} from "@/lib/repositories/supabase-legacy-repository";
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

  const isAuthSessionError = (error: unknown) => {
    const message =
      error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    return (
      message.includes("authentication") ||
      message.includes("session") ||
      message.includes("authenticated user is required") ||
      message.includes("invalid or expired")
    );
  };

  let businessName: string | null = null;
  let paymentsReconciledToday = 0;
  try {
    const context = await resolveLegacyBusinessContextForRequest();
    businessName = context.businessName;
  } catch (error) {
    if (isAuthSessionError(error)) {
      redirect("/login?force=1&next=%2Fdashboard");
    }

    try {
      await provisionLegacyBusinessForAccessToken({ accessToken });
      const context = await resolveLegacyBusinessContextForRequest();
      businessName = context.businessName;
    } catch (fallbackError) {
      if (isAuthSessionError(fallbackError)) {
        redirect("/login?force=1&next=%2Fdashboard");
      }
      throw fallbackError;
    }
  }

  try {
    paymentsReconciledToday = await getPaymentsReconciledTodayCount();
  } catch {
    paymentsReconciledToday = 0;
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
