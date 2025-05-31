'use client'

import { Shield, Calendar, ExternalLink, Eye } from 'lucide-react'
import { generateBlockscoutUrls } from '@/lib/karma-contracts'
import Image from 'next/image'
import { useState } from 'react'

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

function KarmaDetailModal({ nft, isOpen, onClose }: { nft: KarmaNFT; isOpen: boolean; onClose: () => void }) {
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

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'time':
        return 'badge-primary'
      case 'knowledge':
        return 'badge-info'
      case 'gift':
        return 'badge-secondary'
      case 'ecology':
        return 'badge-success'
      case 'care':
        return 'badge-error'
      case 'access':
        return 'badge-warning'
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

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>
          ✕
        </button>
        
        {/* Modal Header */}
        <div className="flex items-start justify-between mb-6 pr-8">
          <div>
            <h3 className="text-2xl font-bold text-neutral mb-2">{nft.title}</h3>
            <div className={`badge ${getCategoryColor(nft.category)}`}>
              {nft.category}
            </div>
          </div>
          {nft.verified && (
            <div className="tooltip" data-tip="Verified good deed">
              <Shield className="w-6 h-6 text-success" />
            </div>
          )}
        </div>

        {/* NFT Image */}
        <div className="w-full h-72 relative overflow-hidden rounded-xl bg-base-200 mb-6 shadow-inner">
          <Image
            src={nft.imageUrl}
            alt={nft.title}
            fill
            className="object-contain"
            sizes="600px"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <h4 className="font-semibold text-neutral mb-2">Description</h4>
          <p className="text-neutral/80 leading-relaxed">{nft.description}</p>
        </div>

        {/* Token ID (if available) */}
        {nft.tokenId && (
          <div className="mb-6">
            <h4 className="font-semibold text-neutral mb-2">Token Information</h4>
            <div className="bg-base-200 p-4 rounded-lg font-mono text-sm">
              <span className="text-neutral/60">Token ID:</span> <span className="text-neutral">{nft.tokenId}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-xl">
            <div className="text-3xl font-bold karma-gradient mb-1">{nft.karmaPoints}</div>
            <div className="text-sm text-neutral/60 font-medium">Karma Points</div>
          </div>
          <div className="text-center bg-base-200 p-4 rounded-xl">
            <div className="text-lg font-semibold text-neutral mb-1">{new Date(nft.dateEarned).toLocaleDateString()}</div>
            <div className="text-sm text-neutral/60 font-medium">Date Earned</div>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-action mt-0">
          <button 
            onClick={handleViewOnExplorer}
            className="btn btn-primary"
          >
            <ExternalLink className="w-4 h-4" />
            View on Explorer
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export function KarmaCard({ nft }: KarmaCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'time':
        return 'badge-primary'
      case 'knowledge':
        return 'badge-info'
      case 'gift':
        return 'badge-secondary'
      case 'ecology':
        return 'badge-success'
      case 'care':
        return 'badge-error'
      case 'access':
        return 'badge-warning'
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

  return (
    <>
      <div 
        className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 karma-card cursor-pointer transform hover:scale-105"
        onClick={() => setIsModalOpen(true)}
      >
        {/* NFT Image */}
        <figure className="px-6 pt-6">
          <div className="w-full h-56 relative overflow-hidden rounded-lg bg-base-200">
            <Image
              src={nft.imageUrl}
              alt={nft.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </figure>

        <div className="card-body p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="card-title text-base font-semibold text-neutral line-clamp-1">{nft.title}</h3>
              <div className={`badge badge-sm ${getCategoryColor(nft.category)} mt-1`}>
                {nft.category}
              </div>
            </div>
            {nft.verified && (
              <Shield className="w-4 h-4 text-success flex-shrink-0" />
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold karma-gradient">{nft.karmaPoints}</div>
              <div className="text-xs text-neutral/60">Karma Points</div>
            </div>
            <div className="flex items-center gap-1 text-xs text-neutral/60">
              <Calendar className="w-3 h-3" />
              {new Date(nft.dateEarned).toLocaleDateString()}
            </div>
          </div>

          {/* Click indicator */}
          <div className="flex items-center justify-center mt-3 text-xs text-neutral/50">
            <Eye className="w-3 h-3 mr-1" />
            Click for details
          </div>
        </div>
      </div>

      <KarmaDetailModal 
        nft={nft} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
} 