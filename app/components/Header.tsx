import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { WalletConnect } from './WalletConnect'

export function Header() {
  return (
    <div className="navbar bg-base-100 shadow-sm border-b">
      <div className="navbar-start">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold karma-gradient">Karma</span>
        </Link>
      </div>
      <div className="navbar-center hidden sm:flex">
        <div className="menu menu-horizontal px-1">
          <Link href="/claim" className="btn btn-ghost btn-sm">
            Claim Karma
          </Link>
          <Link href="/dashboard" className="btn btn-ghost btn-sm">
            Dashboard
          </Link>
          <Link href="/leaderboard" className="btn btn-ghost btn-sm">
            Leaderboard
          </Link>
          <Link href="/shop" className="btn btn-ghost btn-sm">
            Shop
          </Link>
        </div>
      </div>
      <div className="navbar-end">
        <WalletConnect />
      </div>
    </div>
  )
} 