import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { DebugInfo } from '../components/DebugInfo'
import { Header } from '../components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Karma - Soulbound NFTs for Good Deeds',
  description: 'Earn soulbound Karma NFTs for verified good deeds like donations and volunteering',
  keywords: ['NFT', 'Karma', 'Soulbound', 'Charity', 'Web3', 'Good Deeds'],
  authors: [{ name: 'Karma Team' }],
  openGraph: {
    title: 'Karma - Soulbound NFTs for Good Deeds',
    description: 'Earn soulbound Karma NFTs for verified good deeds',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="karma">
      <body className={`${inter.className} min-h-screen bg-base-100`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <DebugInfo />
        </Providers>
      </body>
    </html>
  )
} 