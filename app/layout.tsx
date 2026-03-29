import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WHATSBOARD",
  description: "Turn WhatsApp chats into paid, tracked, completed orders.",
  manifest: "/manifest.json"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
