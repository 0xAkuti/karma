'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { WagmiProvider } from '@privy-io/wagmi'
import { NotificationProvider, TransactionPopupProvider } from '@blockscout/app-sdk'
import { config } from '../lib/wagmi'
import { flowTestnet, anvilLocal } from '../lib/wagmi'
import { TransactionPopupListener } from '../components/TransactionPopupListener'

console.log('Providers.tsx is loading...')

// Blockscout wrapper component
function BlockscoutProviders({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    console.log('BlockscoutProviders mounted')
  }, [])

  console.log('BlockscoutProviders rendering, isMounted:', isMounted)

  if (!isMounted) {
    console.log('BlockscoutProviders not mounted yet, returning children')
    return <>{children}</>
  }

  try {
    console.log('Rendering Blockscout providers...')
    return (
      <NotificationProvider>
        <TransactionPopupProvider>
          <TransactionPopupListener />
          {children}
        </TransactionPopupProvider>
      </NotificationProvider>
    )
  } catch (error) {
    console.error('Error rendering Blockscout providers:', error)
    return <>{children}</>
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  console.log('Main Providers rendering...')

  // Get Privy App ID from environment with validation
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  
  if (!privyAppId || privyAppId === 'your-privy-app-id-here') {
    console.warn('⚠️ Privy App ID not configured. Please set NEXT_PUBLIC_PRIVY_APP_ID in your .env.local file.')
    console.warn('Get your app ID from: https://console.privy.io')
  }

  // Get the default chain based on environment
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '545')
  const defaultChain = chainId === 31337 ? anvilLocal : flowTestnet
  const supportedChains = [flowTestnet, anvilLocal]

  return (
    <PrivyProvider
      appId={privyAppId || 'clzmg6ix400ycl80fwpuqlxxp'} // Fallback demo app ID
      config={{
        // Display configuration
        appearance: {
          theme: 'light',
          accentColor: '#10b981',
          logo: '/karma-logo.png',
        },
        
        // Login methods
        loginMethods: ['wallet', 'email', 'sms'],
        
        // Embedded wallet configuration
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },

        // Network configuration for automatic switching
        defaultChain: defaultChain,
        supportedChains: supportedChains,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <BlockscoutProviders>
            {children}
          </BlockscoutProviders>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
} 