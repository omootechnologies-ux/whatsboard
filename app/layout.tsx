import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/components/i18n/language-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Folapp - From Chat Chaos to Sales Control',
  description: 'Transform your WhatsApp business from overwhelming chaos to organized success. Folapp helps African entrepreneurs manage orders, payments, and deliveries with ease.',
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
  themeColor: '#fafaf7',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-roboto-mono antialiased bg-background text-foreground">
        <LanguageProvider>
          {children}
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  )
}
