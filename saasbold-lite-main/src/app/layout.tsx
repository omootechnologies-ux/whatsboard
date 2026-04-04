import "../styles/globals.css";
import "../styles/satoshi.css";
import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/pwa/pwa-register";

export const metadata: Metadata = {
  title: "WhatsBoard",
  description:
    "Premium fintech-style seller dashboard for East African online sellers turning WhatsApp chat chaos into sales control.",
  applicationName: "WhatsBoard",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "WhatsBoard",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/icons/icon-192x192.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0F5D46",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
