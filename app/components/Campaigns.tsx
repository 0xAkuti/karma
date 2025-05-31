'use client'

import { useState } from 'react'
import { 
  Flame, 
  Target, 
  Gift, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Award, 
  Sparkles,
  ChevronRight,
  CheckCircle,
  Lock,
  Star
} from 'lucide-react'

interface UserStats {
  currentStreak: number
  longestStreak: number
  weeklyKarma: number
  weeklyGoal: number
  totalKarma: number
  level: number
}

interface Challenge {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  karmaReward: number
  bonusMultiplier?: number
  deadline: string
  isCompleted: boolean
  isLocked: boolean
  progress: number
  maxProgress: number
  icon: string
  type: 'weekly' | 'special' | 'milestone'
}

interface Goal {
  id: string
  title: string
  description: string
  target: number
  current: number
  karmaReward: number
  deadline: string
  category: string
  isCompleted: boolean
  icon: string
}

// Mock user stats
const mockUserStats: UserStats = {
  currentStreak: 7,
  longestStreak: 12,
  weeklyKarma: 350,
  weeklyGoal: 500,
  totalKarma: 2450,
  level: 8
}

// Mock challenges
const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Week of Giving',
    description: 'Make 5 verified donations this week',
    category: 'Education',
    difficulty: 'Medium',
    karmaReward: 250,
    bonusMultiplier: 1.5,
    deadline: '2024-02-01',
    isCompleted: false,
    isLocked: false,
    progress: 2,
    maxProgress: 5,
    icon: '🎁',
    type: 'weekly'
  },
  {
    id: '2',
    title: 'Health Hero',
    description: 'Donate blood or volunteer at a health facility',
    category: 'Health',
    difficulty: 'Hard',
    karmaReward: 400,
    deadline: '2024-02-15',
    isCompleted: false,
    isLocked: false,
    progress: 0,
    maxProgress: 1,
    icon: '🩸',
    type: 'special'
  },
  {
    id: '3',
    title: 'Tech for Good',
    description: 'Contribute to 3 open source projects',
    category: 'Technology',
    difficulty: 'Hard',
    karmaReward: 300,
    bonusMultiplier: 2,
    deadline: '2024-02-28',
    isCompleted: false,
    isLocked: false,
    progress: 1,
    maxProgress: 3,
    icon: '💻',
    type: 'special'
  },
  {
    id: '4',
    title: 'Green Warrior',
    description: 'Complete 10 environmental actions',
    category: 'Environment',
    difficulty: 'Medium',
    karmaReward: 200,
    deadline: '2024-02-10',
    isCompleted: true,
    isLocked: false,
    progress: 10,
    maxProgress: 10,
    icon: '🌱',
    type: 'weekly'
  },
  {
    id: '5',
    title: 'Karma Master',
    description: 'Reach 5000 total karma points',
    category: 'General',
    difficulty: 'Hard',
    karmaReward: 1000,
    deadline: '2024-03-31',
    isCompleted: false,
    isLocked: true,
    progress: 2450,
    maxProgress: 5000,
    icon: '👑',
    type: 'milestone'
  }
]

// Mock goals
const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Weekly Karma Target',
    description: 'Earn 500 karma points this week',
    target: 500,
    current: 350,
    karmaReward: 50,
    deadline: '2024-01-28',
    category: 'Weekly',
    isCompleted: false,
    icon: '🎯'
  },
  {
    id: '2',
    title: 'Streak Keeper',
    description: 'Maintain a 14-day streak',
    target: 14,
    current: 7,
    karmaReward: 100,
    deadline: '2024-02-05',
    category: 'Streak',
    isCompleted: false,
    icon: '🔥'
  },
  {
    id: '3',
    title: 'Category Explorer',
    description: 'Earn karma in 4 different categories',
    target: 4,
    current: 3,
    karmaReward: 75,
    deadline: '2024-01-31',
    category: 'Diversity',
    isCompleted: false,
    icon: '🗺️'
  }
]

export function Campaigns() {
  const [activeTab, setActiveTab] = useState<'challenges' | 'goals'>('challenges')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'badge-success'
      case 'Medium': return 'badge-warning'
      case 'Hard': return 'badge-error'
      default: return 'badge-neutral'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weekly': return 'badge-primary'
      case 'special': return 'badge-secondary'
      case 'milestone': return 'badge-accent'
      default: return 'badge-neutral'
    }
  }

  const filteredChallenges = selectedCategory === 'all' 
    ? mockChallenges 
    : mockChallenges.filter(c => c.category.toLowerCase() === selectedCategory)

  const getStreakColor = (streak: number) => {
    if (streak >= 14) return 'text-error'
    if (streak >= 7) return 'text-warning'
    if (streak >= 3) return 'text-success'
    return 'text-neutral'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with User Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold karma-gradient mb-2">Campaigns & Challenges</h1>
            <p className="text-neutral/70">Level up your karma with streaks, goals, and special challenges</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <Flame className="w-8 h-8" />
                </div>
                <div className="stat-title">Current Streak</div>
                <div className={`stat-value ${getStreakColor(mockUserStats.currentStreak)}`}>
                  {mockUserStats.currentStreak} days
                </div>
                <div className="stat-desc">Best: {mockUserStats.longestStreak} days</div>
              </div>
            </div>
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-figure text-secondary">
                  <Target className="w-8 h-8" />
                </div>
                <div className="stat-title">Weekly Progress</div>
                <div className="stat-value text-secondary">
                  {mockUserStats.weeklyKarma}/{mockUserStats.weeklyGoal}
                </div>
                <div className="stat-desc">
                  {Math.round((mockUserStats.weeklyKarma / mockUserStats.weeklyGoal) * 100)}% complete
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Progress Bar */}
        <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg mb-6">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Weekly Goal Progress</h3>
              <div className="badge badge-primary badge-lg">
                Level {mockUserStats.level}
              </div>
            </div>
            <div className="w-full bg-base-300 rounded-full h-4 mb-2">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((mockUserStats.weeklyKarma / mockUserStats.weeklyGoal) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-neutral/70">
              <span>0 karma</span>
              <span>{mockUserStats.weeklyGoal} karma goal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-boxed mb-6">
        <a 
          className={`tab ${activeTab === 'challenges' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          <Award className="w-4 h-4 mr-2" />
          Challenges
        </a>
        <a 
          className={`tab ${activeTab === 'goals' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          <Target className="w-4 h-4 mr-2" />
          Goals
        </a>
      </div>

      {activeTab === 'challenges' && (
        <div>
          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button 
                className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              {['Education', 'Health', 'Technology', 'Environment', 'Community'].map(category => (
                <button 
                  key={category}
                  className={`btn btn-sm ${selectedCategory === category.toLowerCase() ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedCategory(category.toLowerCase())}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Challenges Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => (
              <div 
                key={challenge.id} 
                className={`card shadow-lg transition-all duration-300 hover:shadow-xl ${
                  challenge.isCompleted ? 'bg-success/10 border border-success/20' : 
                  challenge.isLocked ? 'bg-base-200 opacity-60' : 'bg-base-100'
                }`}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{challenge.icon}</div>
                    <div className="flex flex-col gap-1">
                      <div className={`badge ${getTypeColor(challenge.type)} badge-sm`}>
                        {challenge.type}
                      </div>
                      <div className={`badge ${getDifficultyColor(challenge.difficulty)} badge-sm`}>
                        {challenge.difficulty}
                      </div>
                    </div>
                  </div>

                  <h3 className="card-title text-lg mb-2">
                    {challenge.title}
                    {challenge.isLocked && <Lock className="w-4 h-4 text-neutral/50" />}
                    {challenge.isCompleted && <CheckCircle className="w-4 h-4 text-success" />}
                  </h3>

                  <p className="text-neutral/70 text-sm mb-4">{challenge.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{challenge.progress}/{challenge.maxProgress}</span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          challenge.isCompleted ? 'bg-success' : 'bg-primary'
                        }`}
                        style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Reward Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-primary">
                        {challenge.karmaReward} karma
                      </span>
                      {challenge.bonusMultiplier && (
                        <div className="badge badge-accent badge-sm">
                          {challenge.bonusMultiplier}x bonus
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center gap-2 text-sm text-neutral/70 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>Ends {new Date(challenge.deadline).toLocaleDateString()}</span>
                  </div>

                  {/* Action Button */}
                  <div className="card-actions">
                    {challenge.isCompleted ? (
                      <button className="btn btn-success btn-sm w-full" disabled>
                        <CheckCircle className="w-4 h-4" />
                        Completed
                      </button>
                    ) : challenge.isLocked ? (
                      <button className="btn btn-ghost btn-sm w-full" disabled>
                        <Lock className="w-4 h-4" />
                        Locked
                      </button>
                    ) : (
                      <button className="btn btn-primary btn-sm w-full">
                        Start Challenge
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGoals.map((goal) => (
            <div 
              key={goal.id} 
              className={`card shadow-lg transition-all duration-300 hover:shadow-xl ${
                goal.isCompleted ? 'bg-success/10 border border-success/20' : 'bg-base-100'
              }`}
            >
              <div className="card-body">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{goal.icon}</div>
                  <div className="badge badge-outline badge-sm">{goal.category}</div>
                </div>

                <h3 className="card-title text-lg mb-2">
                  {goal.title}
                  {goal.isCompleted && <CheckCircle className="w-4 h-4 text-success" />}
                </h3>

                <p className="text-neutral/70 text-sm mb-4">{goal.description}</p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span className="font-semibold">{goal.current}/{goal.target}</span>
                  </div>
                  <div className="w-full bg-base-300 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        goal.isCompleted ? 'bg-success' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-neutral/70 mt-1">
                    {Math.round((goal.current / goal.target) * 100)}% complete
                  </div>
                </div>

                {/* Reward and Deadline */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-warning" />
                    <span className="font-semibold text-warning">+{goal.karmaReward} karma</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-neutral/70">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action */}
                <div className="card-actions">
                  {goal.isCompleted ? (
                    <button className="btn btn-success btn-sm w-full" disabled>
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </button>
                  ) : (
                    <button className="btn btn-outline btn-sm w-full">
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Motivational Section */}
      <div className="mt-12">
        <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 shadow-xl">
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold mb-4">Keep Up the Great Work! 🚀</h2>
            <p className="text-lg text-neutral/80 mb-6">
              You're making a real difference in the world. Every verified good deed counts!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="stat">
                <div className="stat-title">This Week</div>
                <div className="stat-value text-primary">+{mockUserStats.weeklyKarma}</div>
                <div className="stat-desc">karma earned</div>
              </div>
              <div className="stat">
                <div className="stat-title">Streak</div>
                <div className="stat-value text-warning">{mockUserStats.currentStreak}</div>
                <div className="stat-desc">days active</div>
              </div>
              <div className="stat">
                <div className="stat-title">Level</div>
                <div className="stat-value text-secondary">{mockUserStats.level}</div>
                <div className="stat-desc">karma master</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 