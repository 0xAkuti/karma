'use client'

import { Inter } from 'next/font/google'
import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotificationProvider, TransactionPopupProvider } from '@blockscout/app-sdk'
import { config } from '@/lib/wagmi'
import { Header } from '@/components/Header'
import { TransactionPopupListener } from '@/components/TransactionPopupListener'
import { TransactionNotificationManager } from '@/components/TransactionNotificationManager'
import { DebugInfo } from '@/components/DebugInfo'
import { useState, useEffect } from 'react'
import './globals.css'

console.log('Layout.tsx is loading...')

const inter = Inter({ subsets: ['latin'] })

// Debug component to test if providers are working
function DebugComponent() {
  useEffect(() => {
    console.log('DebugComponent mounted inside Blockscout providers')
  }, [])
  return null
}

function BlockscoutProviders({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    console.log('BlockscoutProviders useEffect - setting isMounted to true')
  }, [])

  console.log('BlockscoutProviders rendering, isMounted:', isMounted)

  try {
    console.log('Rendering Blockscout providers...')
    return (
      <NotificationProvider>
        <TransactionPopupProvider>
          <DebugComponent />
          {isMounted && (
            <>
              <TransactionPopupListener />
              <TransactionNotificationManager />
            </>
          )}
          {children}
        </TransactionPopupProvider>
      </NotificationProvider>
    )
  } catch (error) {
    console.error('Error rendering Blockscout providers:', error)
    return <>{children}</>
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())
  
  console.log('RootLayout rendering...')

  return (
    <html lang="en" data-theme="light">
      <body className={inter.className}>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'placeholder-app-id'}
          config={{
            appearance: {
              theme: 'light',
            },
            embeddedWallets: {
              createOnLogin: 'users-without-wallets',
            },
          }}
        >
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>
              <BlockscoutProviders>
                <div className="min-h-screen bg-base-100">
                  <Header />
                  <main>
                    {children}
                  </main>
                  <DebugInfo />
                </div>
              </BlockscoutProviders>
            </WagmiProvider>
          </QueryClientProvider>
        </PrivyProvider>
      </body>
    </html>
  )
} 