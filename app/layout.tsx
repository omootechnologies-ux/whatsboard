import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WhatsBoard - From Chat Chaos to Sales Control',
  description: 'Transform your WhatsApp business from overwhelming chaos to organized success. WhatsBoard helps African entrepreneurs manage orders, payments, and deliveries with ease.',
  generator: 'v0.app',
  keywords: ['WhatsApp business', 'order management', 'African entrepreneurs', 'e-commerce', 'Tanzania', 'Kenya'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0b7a43',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-roboto-mono antialiased bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
