'use client'

import { usePrivy } from '@privy-io/react-auth'
import Link from 'next/link'
import { WalletConnect } from './WalletConnect'
import { KarmaCard } from './KarmaCard'
import { Sparkles, Plus, Award, Trophy, Star } from 'lucide-react'

// Mock data for development
const mockKarmaNFTs = [
  {
    id: 1,
    title: 'Wikipedia Donation',
    description: 'Donated $50 to Wikipedia Foundation',
    category: 'Education',
    karmaPoints: 100,
    dateEarned: '2024-01-15',
    imageUrl: '/karma-badges/wikipedia.png',
    verified: true,
  },
  {
    id: 2,
    title: 'Open Source Contributor',
    description: 'Contributed to React documentation',
    category: 'Technology',
    karmaPoints: 150,
    dateEarned: '2024-01-10',
    imageUrl: '/karma-badges/opensource.png',
    verified: true,
  },
  {
    id: 3,
    title: 'Red Cross Blood Donation',
    description: 'Donated blood at local Red Cross center',
    category: 'Health',
    karmaPoints: 200,
    dateEarned: '2024-01-05',
    imageUrl: '/karma-badges/blood-donation.png',
    verified: true,
  },
]

const supportedProjects = [
  { name: 'Wikipedia Donations', category: 'Education', icon: '📚', estimatedKarma: '50-200' },
  { name: 'Red Cross Blood Donations', category: 'Health', icon: '🩸', estimatedKarma: '150-300' },
  { name: 'Devcon Volunteering', category: 'Technology', icon: '🛠️', estimatedKarma: '100-250' },
  { name: 'Open Source Contributions', category: 'Technology', icon: '💻', estimatedKarma: '75-400' },
  { name: 'Environmental Actions', category: 'Environment', icon: '🌱', estimatedKarma: '80-180' },
  { name: 'Community Service', category: 'Community', icon: '🤝', estimatedKarma: '100-300' },
]

export function Dashboard() {
  const { user } = usePrivy()
  const totalKarma = mockKarmaNFTs.reduce((sum, nft) => sum + nft.karmaPoints, 0)

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-sm border-b">
        <div className="navbar-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold karma-gradient">Karma</span>
          </div>
        </div>
        <div className="navbar-end">
          <WalletConnect />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral">
                Welcome back! 👋
              </h1>
              <p className="text-neutral/70 mt-1">
                Your impact grows with every good deed
              </p>
            </div>
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="stat-title">Total Karma</div>
                <div className="stat-value text-primary karma-gradient">{totalKarma}</div>
                <div className="stat-desc">From {mockKarmaNFTs.length} good deeds</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Link href="/claim" className="btn btn-primary btn-lg">
              <Plus className="w-5 h-5" />
              Claim New Karma
            </Link>
            <button className="btn btn-outline">
              <Award className="w-5 h-5" />
              Redeem Karma
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Karma NFTs */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral">Your Karma Collection</h2>
              <div className="badge badge-primary badge-lg">
                <Star className="w-4 h-4 mr-1" />
                {mockKarmaNFTs.length} NFTs
              </div>
            </div>

            {mockKarmaNFTs.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {mockKarmaNFTs.map((nft) => (
                  <KarmaCard key={nft.id} nft={nft} />
                ))}
              </div>
            ) : (
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body items-center text-center py-16">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="card-title text-neutral mb-2">No Karma NFTs Yet</h3>
                  <p className="text-neutral/70 mb-6">
                    Start your journey by claiming your first Karma NFT for a verified good deed.
                  </p>
                  <Link href="/claim" className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    Claim Your First Karma
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Supported Projects */}
          <div>
            <h3 className="text-xl font-bold text-neutral mb-6">Supported Projects</h3>
            <div className="space-y-4">
              {supportedProjects.map((project, index) => (
                <Link key={index} href="/claim" className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="card-body p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{project.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-neutral">{project.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="badge badge-secondary badge-sm">{project.category}</div>
                          <span className="text-sm text-neutral/70">
                            {project.estimatedKarma} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 shadow-lg mt-6">
              <div className="card-body">
                <h4 className="font-semibold text-neutral mb-4">Your Impact</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral/70">Categories</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral/70">This Month</span>
                    <span className="font-semibold">+{totalKarma}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral/70">Ranking</span>
                    <span className="font-semibold text-primary">Top 15%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 