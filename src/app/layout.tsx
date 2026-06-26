import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import Navbar from '@/components/Navbar'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Top Creators by Industry — Upfluence',
  description:
    'Discover the top 10 creators across Beauty, Fashion, Fitness, Food, and Gaming, ranked by Creator Power Score.',
  openGraph: {
    title: 'Top Creators by Industry — Upfluence',
    description: 'Data-driven influencer rankings powered by the Upfluence API.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_SITE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider>
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">{children}</main>
          <footer className="border-t py-4 text-center text-sm text-muted-foreground">
            Powered by{' '}
            <a
              href="https://www.upfluence.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
              style={{ color: '#0d0de6' }}
            >
              Upfluence
            </a>{' '}
            · Rankings refresh every 24h
          </footer>
        </TooltipProvider>
      </body>
    </html>
  )
}
