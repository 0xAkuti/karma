'use client'

import { useState } from 'react'
import { Trophy, TrendingUp, Medal, Star, ChevronUp, ChevronDown, Flame, Award, Users, BarChart3 } from 'lucide-react'
import { LeaderboardStats } from './LeaderboardStats'
import { KarmaDistributionChart } from './KarmaDistributionChart'

// Mock data for leaderboard
interface LeaderboardUser {
  id: string
  address: string
  username?: string
  totalKarma: number
  nftCount: number
  rank: number
  categories: { [category: string]: number }
  recentChange: number // karma gained in last 7 days
  isCurrentUser?: boolean
  avatar?: string
  badges: string[]
}

const mockLeaderboardData: LeaderboardUser[] = [
  {
    id: '1',
    address: '0x1234...5678',
    username: 'KarmaKing',
    totalKarma: 2850,
    nftCount: 18,
    rank: 1,
    categories: { Education: 800, Health: 950, Technology: 700, Environment: 400 },
    recentChange: 450,
    avatar: '🏆',
    badges: ['Pioneer', 'Philanthropist', 'Tech Contributor']
  },
  {
    id: '2',
    address: '0x2345...6789',
    username: 'GoodDeedGuru',
    totalKarma: 2100,
    nftCount: 14,
    rank: 2,
    categories: { Health: 800, Education: 600, Community: 500, Environment: 200 },
    recentChange: 320,
    avatar: '🌟',
    badges: ['Health Hero', 'Educator']
  },
  {
    id: '3',
    address: '0x3456...7890',
    username: 'EcoWarrior',
    totalKarma: 1950,
    nftCount: 13,
    rank: 3,
    categories: { Environment: 1200, Education: 400, Community: 350 },
    recentChange: 280,
    avatar: '🌱',
    badges: ['Green Guardian', 'Climate Champion']
  },
  {
    id: '4',
    address: '0x4567...8901',
    username: 'TechForGood',
    totalKarma: 1750,
    nftCount: 11,
    rank: 4,
    categories: { Technology: 1100, Education: 400, Community: 250 },
    recentChange: 180,
    avatar: '⚡',
    badges: ['Code Contributor', 'Open Source Hero']
  },
  {
    id: '5',
    address: '0x5678...9012',
    username: 'HealthHelper',
    totalKarma: 1650,
    nftCount: 10,
    rank: 5,
    categories: { Health: 1000, Education: 350, Community: 300 },
    recentChange: 220,
    avatar: '🩺',
    badges: ['Medical Volunteer', 'Life Saver']
  },
  {
    id: '6',
    address: '0x6789...0123',
    username: 'You',
    totalKarma: 450,
    nftCount: 3,
    rank: 47,
    categories: { Education: 100, Technology: 150, Health: 200 },
    recentChange: 150,
    isCurrentUser: true,
    avatar: '👤',
    badges: ['Newcomer']
  }
]

const categories = ['Education', 'Health', 'Technology', 'Environment', 'Community']

const categoryIcons = {
  Education: '📚',
  Health: '🏥',
  Technology: '💻',
  Environment: '🌱',
  Community: '🤝'
}

const categoryColors = {
  Education: 'badge-info',
  Health: 'badge-error',
  Technology: 'badge-secondary',
  Environment: 'badge-success',
  Community: 'badge-warning'
}

export function Leaderboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Education')
  const [selectedTab, setSelectedTab] = useState<'total' | 'weekly' | 'categories'>('total')

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-500" />
    return <span className="text-lg font-bold text-neutral/70">#{rank}</span>
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ChevronUp className="w-4 h-4 text-success" />
    if (change < 0) return <ChevronDown className="w-4 h-4 text-error" />
    return null
  }

  const getCategoryLeaderboard = (category: string) => {
    return mockLeaderboardData
      .map(user => ({
        ...user,
        categoryKarma: user.categories[category] || 0
      }))
      .filter(user => user.categoryKarma > 0)
      .sort((a, b) => b.categoryKarma - a.categoryKarma)
      .slice(0, 10)
  }

  const getTopMovers = () => {
    return [...mockLeaderboardData]
      .sort((a, b) => b.recentChange - a.recentChange)
      .slice(0, 10)
  }

  const totalUsers = 1247
  const totalKarmaDistributed = 45890
  const currentUser = mockLeaderboardData.find(u => u.isCurrentUser)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold karma-gradient mb-2">Karma Leaderboard</h1>
            <p className="text-neutral/70">See how your good deeds stack up against the community</p>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Users className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Users</div>
              <div className="stat-value text-primary">{totalUsers.toLocaleString()}</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-secondary">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Karma</div>
              <div className="stat-value text-secondary">{totalKarmaDistributed.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Your Rank Card */}
        {currentUser && (
          <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg mb-6">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl">
                      {currentUser.avatar}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Your Rank</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold karma-gradient">#{currentUser.rank}</span>
                      <span className="text-neutral/70">•</span>
                      <span className="font-semibold">{currentUser.totalKarma} Karma</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-success font-semibold">+{currentUser.recentChange} this week</span>
                  </div>
                  <div className="text-neutral/70">{currentUser.nftCount} NFTs collected</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <LeaderboardStats
        totalUsers={totalUsers}
        totalKarma={totalKarmaDistributed}
        weeklyActiveUsers={342}
        newUsersThisWeek={89}
        topCategoryThisWeek="Health"
        averageKarmaPerUser={Math.round(totalKarmaDistributed / totalUsers)}
      />

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6 bg-base-200">
        <button 
          className={`tab ${selectedTab === 'total' ? 'tab-active' : ''}`}
          onClick={() => setSelectedTab('total')}
        >
          <Trophy className="w-4 h-4 mr-2" />
          Total Rankings
        </button>
        <button 
          className={`tab ${selectedTab === 'weekly' ? 'tab-active' : ''}`}
          onClick={() => setSelectedTab('weekly')}
        >
          <Flame className="w-4 h-4 mr-2" />
          Top Movers
        </button>
        <button 
          className={`tab ${selectedTab === 'categories' ? 'tab-active' : ''}`}
          onClick={() => setSelectedTab('categories')}
        >
          <Award className="w-4 h-4 mr-2" />
          By Category
        </button>
      </div>

      {/* Content based on selected tab */}
      {selectedTab === 'total' && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-header p-6 border-b">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Global Karma Rankings
            </h2>
          </div>
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>User</th>
                    <th>Total Karma</th>
                    <th>NFTs</th>
                    <th>Weekly Change</th>
                    <th>Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {mockLeaderboardData.slice(0, 10).map((user) => (
                    <tr key={user.id} className={user.isCurrentUser ? 'bg-primary/5' : ''}>
                      <td>
                        <div className="flex items-center gap-2">
                          {getRankIcon(user.rank)}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              {user.avatar}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{user.username || 'Anonymous'}</div>
                            <div className="text-sm text-neutral/70 font-mono">
                              {user.address.slice(0, 6)}...{user.address.slice(-4)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-bold karma-gradient text-lg">{user.totalKarma}</div>
                      </td>
                      <td>
                        <div className="badge badge-primary">{user.nftCount}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          {getChangeIcon(user.recentChange)}
                          <span className={user.recentChange > 0 ? 'text-success' : user.recentChange < 0 ? 'text-error' : ''}>
                            {user.recentChange > 0 ? '+' : ''}{user.recentChange}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {user.badges.slice(0, 2).map((badge, idx) => (
                            <div key={idx} className="badge badge-outline badge-sm">{badge}</div>
                          ))}
                          {user.badges.length > 2 && (
                            <div className="badge badge-ghost badge-sm">+{user.badges.length - 2}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'weekly' && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-header p-6 border-b">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              Top Movers This Week
            </h2>
          </div>
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>User</th>
                    <th>Karma Gained</th>
                    <th>Current Total</th>
                    <th>Growth Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {getTopMovers().map((user, index) => (
                    <tr key={user.id} className={user.isCurrentUser ? 'bg-primary/5' : ''}>
                      <td>
                        <div className="flex items-center gap-2">
                          {index < 3 ? (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-neutral/70">#{index + 1}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              {user.avatar}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{user.username || 'Anonymous'}</div>
                            <div className="text-sm text-neutral/70">Rank #{user.rank}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-success" />
                          <span className="font-bold text-success text-lg">+{user.recentChange}</span>
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold karma-gradient">{user.totalKarma}</div>
                      </td>
                      <td>
                        <div className="badge badge-success">
                          {((user.recentChange / (user.totalKarma - user.recentChange)) * 100).toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'categories' && (
        <div className="space-y-6">
          {/* Category Selector */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-outline'}`}
              >
                <span className="mr-2">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                {category}
              </button>
            ))}
          </div>

          {/* Category Leaderboard */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-header p-6 border-b">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-2xl">{categoryIcons[selectedCategory as keyof typeof categoryIcons]}</span>
                {selectedCategory} Leaders
              </h2>
            </div>
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>User</th>
                      <th>{selectedCategory} Karma</th>
                      <th>% of Total</th>
                      <th>Global Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCategoryLeaderboard(selectedCategory).map((user, index) => (
                      <tr key={user.id} className={user.isCurrentUser ? 'bg-primary/5' : ''}>
                        <td>
                          {index < 3 ? (
                            getRankIcon(index + 1)
                          ) : (
                            <span className="text-lg font-bold text-neutral/70">#{index + 1}</span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                {user.avatar}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">{user.username || 'Anonymous'}</div>
                              <div className="text-sm text-neutral/70 font-mono">
                                {user.address.slice(0, 6)}...{user.address.slice(-4)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="font-bold text-lg karma-gradient">{user.categoryKarma}</div>
                        </td>
                        <td>
                          <div className="badge badge-outline">
                            {((user.categoryKarma / user.totalKarma) * 100).toFixed(1)}%
                          </div>
                        </td>
                        <td>
                          <div className="text-neutral/70">#{user.rank}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 