'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Wallet, LogOut, User, History } from 'lucide-react'

export function WalletConnect() {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!ready || !isMounted) {
    return (
      <div className="skeleton w-32 h-12 rounded-btn"></div>
    )
  }

  if (authenticated && user) {
    return (
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-primary">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">
            {user.wallet?.address?.slice(0, 6)}...{user.wallet?.address?.slice(-4)}
          </span>
        </div>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
          <li>
            <a className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </a>
          </li>
          <li>
            <TransactionHistoryButton userAddress={user?.wallet?.address} />
          </li>
          <li>
            <a onClick={logout} className="flex items-center gap-2 text-error">
              <LogOut className="w-4 h-4" />
              Disconnect
            </a>
          </li>
        </ul>
      </div>
    )
  }

  return (
    <button 
      onClick={login} 
      className="btn btn-primary btn-lg animate-bounce-gentle"
    >
      <Wallet className="w-5 h-5" />
      Connect Wallet
    </button>
  )
}

// Separate client-side component for transaction history
function TransactionHistoryButton({ userAddress }: { userAddress?: string }) {
  const handleViewTransactions = () => {
    console.log('Transaction History button clicked')
    console.log('User address:', userAddress)
    
    // Use the actual configured chain ID
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '545'
    console.log('Chain ID from env:', process.env.NEXT_PUBLIC_CHAIN_ID)
    console.log('Using chain ID:', chainId)
    console.log('Blockscout URL from env:', process.env.NEXT_PUBLIC_BLOCKSCOUT_URL)
    
    // Create a custom event to trigger the transaction popup
    const event = new CustomEvent('openTransactionPopup', {
      detail: {
        chainId,
        address: userAddress,
        blockscoutUrl: process.env.NEXT_PUBLIC_BLOCKSCOUT_URL,
      }
    })
    
    console.log('Dispatching event with detail:', event.detail)
    window.dispatchEvent(event)
    console.log('Event dispatched')
  }

  return (
    <li>
      <button 
        onClick={handleViewTransactions}
        className="flex items-center gap-2 px-4 py-2 hover:bg-base-200 w-full text-left"
      >
        <History className="w-4 h-4" />
        Transaction History
      </button>
    </li>
  )
} 