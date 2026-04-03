import { DashboardShell } from "@/components/whatsboard-dashboard/dashboard-shell";
import { WHATSBOARD_ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
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
  try {
    const context = await resolveLegacyBusinessContextForRequest();
    businessName = context.businessName;
  } catch {
    redirect("/login?next=%2Fdashboard");
  }

  return (
    <Providers>
      <DashboardShell workspaceName={businessName}>{children}</DashboardShell>
    </Providers>
  );
}
