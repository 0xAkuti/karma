'use client'

import { usePrivy } from '@privy-io/react-auth'
import Link from 'next/link'
import { KarmaCard } from './KarmaCard'
import { Sparkles, Plus, Award, Trophy, Star, Target } from 'lucide-react'

// Mock data for development - using actual NFT images
const mockKarmaNFTs = [
  {
    id: 1,
    title: 'Time Volunteer at ETHGlobal',
    description: 'Volunteered 8 hours at ETHGlobal Prague hackathon helping developers',
    category: 'Time',
    karmaPoints: 200,
    dateEarned: '2025-05-15',
    imageUrl: '/nft/Time-ethglobal.png',
    verified: true,
  },
  {
    id: 2,
    title: 'Knowledge Sharing on GitHub',
    description: 'Contributed to open source documentation and helped 50+ developers',
    category: 'Knowledge',
    karmaPoints: 150,
    dateEarned: '2025-05-10',
    imageUrl: '/nft/knowledge-github.png',
    verified: true,
  },
  {
    id: 3,
    title: 'Gift to Wikipedia Foundation',
    description: 'Donated $100 to support free knowledge for everyone',
    category: 'Gift',
    karmaPoints: 180,
    dateEarned: '2025-05-08',
    imageUrl: '/nft/gift-wiki.png',
    verified: true,
  },
  {
    id: 4,
    title: 'Ecology Conservation via iNaturalist',
    description: 'Documented 25 species and contributed to biodiversity research',
    category: 'Ecology',
    karmaPoints: 120,
    dateEarned: '2025-05-05',
    imageUrl: '/nft/ecology-inaturalist.png',
    verified: true,
  },
  {
    id: 5,
    title: 'Animal Care at Psi Zivot Shelter',
    description: 'Volunteered at Psi Zivot animal shelter caring for rescued cats and dogs',
    category: 'Care',
    karmaPoints: 250,
    dateEarned: '2025-05-03',
    imageUrl: '/nft/care-NTF.png',
    verified: true,
  },
  {
    id: 6,
    title: 'Access to Knowledge via Sci-Hub',
    description: 'Helped make 15 research papers accessible to underserved communities',
    category: 'Access',
    karmaPoints: 175,
    dateEarned: '2025-05-01',
    imageUrl: '/nft/access-scihub.png',
    verified: true,
  },
]

const supportedProjects = [
  { name: 'Wikipedia Donations', category: 'Gift', icon: '📚', estimatedKarma: '50-200' },
  { name: 'ETHGlobal Volunteering', category: 'Time', icon: '🛠️', estimatedKarma: '100-250' },
  { name: 'Open Source Contributions', category: 'Knowledge', icon: '💻', estimatedKarma: '75-400' },
  { name: 'iNaturalist Species Documentation', category: 'Ecology', icon: '🌱', estimatedKarma: '80-180' },
  { name: 'Animal Shelter Volunteering', category: 'Care', icon: '🐕', estimatedKarma: '100-300' },
  { name: 'Research Paper Access', category: 'Access', icon: '🔬', estimatedKarma: '90-220' },
]

export function Dashboard() {
  const { user } = usePrivy()
  const totalKarma = mockKarmaNFTs.reduce((sum, nft) => sum + nft.karmaPoints, 0)

  return (
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
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/claim" className="btn btn-primary btn-lg">
            <Plus className="w-5 h-5" />
            Claim New Karma
          </Link>
          <Link href="/campaigns" className="btn btn-outline">
            <Target className="w-5 h-5" />
            View Challenges
          </Link>
          <Link href="/shop" className="btn btn-outline">
            <Award className="w-5 h-5" />
            Redeem Karma
          </Link>
          <Link href="/leaderboard" className="btn btn-outline">
            <Trophy className="w-5 h-5" />
            View Leaderboard
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Karma NFTs */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
            <h2 className="text-2xl font-bold text-neutral">Your Karma Collection</h2>
              <p className="text-sm text-neutral/60 mt-1">Past karma NFTs earned through verified good deeds</p>
            </div>
            <div className="badge badge-primary badge-lg">
              <Star className="w-4 h-4 mr-1" />
              {mockKarmaNFTs.length} NFTs
            </div>
          </div>

          {mockKarmaNFTs.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
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
  )
} 