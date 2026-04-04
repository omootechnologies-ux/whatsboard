import { PublicFooter } from "@/components/whatsboard-public/public-footer";
import { PublicNav } from "@/components/whatsboard-public/public-nav";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <PublicNav />
      {children}
      <PublicFooter />
      <PwaInstallPrompt />
    </div>
  );
}
