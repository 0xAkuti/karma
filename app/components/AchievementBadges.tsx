'use client'

import { Crown, Star, Shield, Flame, Heart, Code, Leaf, HandHeart } from 'lucide-react'

interface Badge {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: string
  earnedAt?: string
}

interface AchievementBadgesProps {
  badges: string[]
  showDetails?: boolean
}

const badgeDefinitions: { [key: string]: Badge } = {
  'Pioneer': {
    id: 'pioneer',
    name: 'Pioneer',
    description: 'One of the first 100 users',
    icon: <Crown className="w-4 h-4" />,
    rarity: 'legendary',
    category: 'Special'
  },
  'Philanthropist': {
    id: 'philanthropist', 
    name: 'Philanthropist',
    description: 'Donated over $1000 total',
    icon: <Heart className="w-4 h-4" />,
    rarity: 'epic',
    category: 'Giving'
  },
  'Tech Contributor': {
    id: 'tech-contributor',
    name: 'Tech Contributor',
    description: 'Contributed to 10+ tech projects',
    icon: <Code className="w-4 h-4" />,
    rarity: 'rare',
    category: 'Technology'
  },
  'Health Hero': {
    id: 'health-hero',
    name: 'Health Hero',
    description: 'Completed 5+ health-related good deeds',
    icon: <Shield className="w-4 h-4" />,
    rarity: 'rare',
    category: 'Health'
  },
  'Educator': {
    id: 'educator',
    name: 'Educator',
    description: 'Supported educational causes',
    icon: <Star className="w-4 h-4" />,
    rarity: 'common',
    category: 'Education'
  },
  'Green Guardian': {
    id: 'green-guardian',
    name: 'Green Guardian',
    description: 'Dedicated to environmental causes',
    icon: <Leaf className="w-4 h-4" />,
    rarity: 'rare',
    category: 'Environment'
  },
  'Climate Champion': {
    id: 'climate-champion',
    name: 'Climate Champion',
    description: 'Earned 1000+ environment karma',
    icon: <Leaf className="w-4 h-4" />,
    rarity: 'epic',
    category: 'Environment'
  },
  'Code Contributor': {
    id: 'code-contributor',
    name: 'Code Contributor',
    description: 'Open source contributor',
    icon: <Code className="w-4 h-4" />,
    rarity: 'common',
    category: 'Technology'
  },
  'Open Source Hero': {
    id: 'open-source-hero',
    name: 'Open Source Hero',
    description: 'Major open source contributions',
    icon: <Star className="w-4 h-4" />,
    rarity: 'epic',
    category: 'Technology'
  },
  'Medical Volunteer': {
    id: 'medical-volunteer',
    name: 'Medical Volunteer',
    description: 'Volunteered in medical contexts',
    icon: <Heart className="w-4 h-4" />,
    rarity: 'rare',
    category: 'Health'
  },
  'Life Saver': {
    id: 'life-saver',
    name: 'Life Saver',
    description: 'Life-saving contributions',
    icon: <Shield className="w-4 h-4" />,
    rarity: 'epic',
    category: 'Health'
  },
  'Newcomer': {
    id: 'newcomer',
    name: 'Newcomer',
    description: 'Welcome to Karma!',
    icon: <HandHeart className="w-4 h-4" />,
    rarity: 'common',
    category: 'Special'
  }
}

const rarityColors = {
  'common': 'badge-info',
  'rare': 'badge-primary',
  'epic': 'badge-secondary',
  'legendary': 'badge-warning'
}

export function AchievementBadges({ badges, showDetails = false }: AchievementBadgesProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {badges.map((badgeName) => {
        const badge = badgeDefinitions[badgeName]
        if (!badge) return null

        return (
          <div
            key={badge.id}
            className={`badge ${rarityColors[badge.rarity]} gap-1 ${showDetails ? 'tooltip' : ''}`}
            data-tip={showDetails ? badge.description : undefined}
          >
            {badge.icon}
            <span className="text-xs">{badge.name}</span>
          </div>
        )
      })}
    </div>
  )
} 