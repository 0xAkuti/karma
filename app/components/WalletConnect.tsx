'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Wallet, LogOut, User } from 'lucide-react'

export function WalletConnect() {
  const { ready, authenticated, user, login, logout } = usePrivy()

  if (!ready) {
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