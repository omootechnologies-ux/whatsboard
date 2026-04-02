import { DashboardShell } from "@/components/whatsboard-dashboard/dashboard-shell";
import { WHATSBOARD_ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
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

  return (
    <Providers>
      <DashboardShell>{children}</DashboardShell>
    </Providers>
  );
}
