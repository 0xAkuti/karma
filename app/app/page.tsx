'use client'

import { usePrivy } from '@privy-io/react-auth'
import { WalletConnect } from '../components/WalletConnect'
import { Dashboard } from '../components/Dashboard'
import { Hero } from '../components/Hero'

export default function Home() {
  const { ready, authenticated } = usePrivy()

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  if (!authenticated) {
    return <Hero />
  }

  return <Dashboard />
} 