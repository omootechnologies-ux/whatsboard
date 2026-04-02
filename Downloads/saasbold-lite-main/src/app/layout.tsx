import "../styles/globals.css";
import "../styles/satoshi.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WhatsBoard",
  description:
    "Premium fintech-style seller dashboard for East African online sellers turning WhatsApp chat chaos into sales control.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
