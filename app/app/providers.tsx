'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { WagmiProvider } from '@privy-io/wagmi'
import { config } from '../lib/wagmi'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  // Get Privy App ID from environment with validation
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  
  if (!privyAppId || privyAppId === 'your-privy-app-id-here') {
    console.warn('⚠️ Privy App ID not configured. Please set NEXT_PUBLIC_PRIVY_APP_ID in your .env.local file.')
    console.warn('Get your app ID from: https://console.privy.io')
  }

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
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
} 