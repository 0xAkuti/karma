'use client'

import { Shield, Calendar, ExternalLink } from 'lucide-react'
import { generateBlockscoutUrls } from '@/lib/karma-contracts'

interface KarmaNFT {
  id: number
  title: string
  description: string
  category: string
  karmaPoints: number
  dateEarned: string
  imageUrl: string
  verified: boolean
  tokenId?: string
  transactionHash?: string
}

interface KarmaCardProps {
  nft: KarmaNFT
}

export function KarmaCard({ nft }: KarmaCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'education':
        return 'badge-info'
      case 'technology':
        return 'badge-secondary'
      case 'health':
        return 'badge-error'
      case 'environment':
        return 'badge-success'
      case 'community':
        return 'badge-warning'
      default:
        return 'badge-primary'
    }
  }

  const handleViewOnExplorer = () => {
    if (nft.tokenId) {
      const urls = generateBlockscoutUrls(nft.tokenId, nft.transactionHash)
      const targetUrl = urls.transaction || urls.token
      if (targetUrl) {
        window.open(targetUrl, '_blank')
      }
    } else {
      // Fallback for mock data - open general blockscout
      const baseUrl = process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL?.replace('/api', '') || 'https://testnet.flowdiver.io'
      window.open(baseUrl, '_blank')
    }
  }

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 karma-card">
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <h3 className="card-title text-base font-semibold text-neutral">{nft.title}</h3>
              <div className={`badge badge-sm ${getCategoryColor(nft.category)}`}>
                {nft.category}
              </div>
            </div>
          </div>
          {nft.verified && (
            <div className="tooltip" data-tip="Verified good deed">
              <Shield className="w-5 h-5 text-success" />
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-neutral/70 text-sm mb-4">{nft.description}</p>

        {/* Token ID (if available) */}
        {nft.tokenId && (
          <div className="text-xs text-neutral/60 mb-2 font-mono">
            Token ID: {nft.tokenId.slice(0, 8)}...{nft.tokenId.slice(-6)}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="stat-container">
            <div className="text-2xl font-bold karma-gradient">{nft.karmaPoints}</div>
            <div className="text-xs text-neutral/60">Karma Points</div>
          </div>
          <div className="flex items-center gap-1 text-xs text-neutral/60">
            <Calendar className="w-3 h-3" />
            {new Date(nft.dateEarned).toLocaleDateString()}
          </div>
        </div>

        {/* Actions */}
        <div className="card-actions justify-end">
          <button 
            onClick={handleViewOnExplorer}
            className="btn btn-ghost btn-sm"
          >
            <ExternalLink className="w-4 h-4" />
            View on Explorer
          </button>
        </div>
      </div>
    </div>
  )
} 