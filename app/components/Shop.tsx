'use client'

import { useState } from 'react'
import { ShoppingBag, Gift, Star, Clock, Check, ExternalLink, Zap, Coffee, Ticket, CreditCard } from 'lucide-react'
import { RedemptionModal } from './RedemptionModal'

interface Reward {
  id: string
  name: string
  description: string
  cost: number
  icon: React.ReactNode
  category: 'vouchers' | 'events' | 'crypto' | 'merits'
  available: boolean
  image?: string
  features?: string[]
  externalLink?: string
  discount?: string
}

const rewards: Reward[] = [
  {
    id: 'blockscout-merits',
    name: 'Blockscout Merits',
    description: 'Convert your Karma into Blockscout Merits for blockchain explorer features',
    cost: 100,
    icon: <Zap className="w-6 h-6" />,
    category: 'merits',
    available: true,
    image: 'https://sourcify.dev/static/media/blockscout.823a50aeffebe304645d.png',
    features: [
      '1 Karma = 2 Merits',
      'Enhanced explorer features',
      'API access credits',
      'Priority support'
    ],
    externalLink: 'https://docs.blockscout.com/devs/integrate-merits'
  },
  {
    id: 'amazon-voucher-25',
    name: '$25 Amazon Gift Card',
    description: 'Get a $25 Amazon gift card to shop for anything you need',
    cost: 2500,
    icon: <Gift className="w-6 h-6" />,
    category: 'vouchers',
    available: false,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
    features: [
      'Digital delivery',
      'No expiration date',
      'Valid worldwide',
      'Instant redemption'
    ]
  },
  {
    id: 'amazon-voucher-50',
    name: '$50 Amazon Gift Card',
    description: 'Get a $50 Amazon gift card for bigger purchases',
    cost: 4500,
    icon: <Gift className="w-6 h-6" />,
    category: 'vouchers',
    available: false,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
    features: [
      'Digital delivery',
      'No expiration date',
      'Valid worldwide',
      'Instant redemption'
    ]
  },
  {
    id: 'starbucks-voucher',
    name: '$15 Starbucks Gift Card',
    description: 'Enjoy your favorite coffee and treats at Starbucks',
    cost: 1500,
    icon: <Coffee className="w-6 h-6" />,
    category: 'vouchers',
    available: false,
    image: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png',
    features: [
      'Digital delivery',
      'Valid at any Starbucks',
      'Mobile app compatible',
      'No expiration date'
    ]
  },
  {
    id: 'ethglobal-pragma-ticket',
    name: 'EthGlobal Pragma Ticket',
    description: 'Get a free ticket to EthGlobal Pragma conference',
    cost: 8000,
    icon: <Ticket className="w-6 h-6" />,
    category: 'events',
    available: false,
    image: 'https://ethglobal.b-cdn.net/events/pragma-prague/square-logo/default.png',
    features: [
      'Full conference access',
      'Networking events',
      'Workshop participation',
      'Swag bag included'
    ],
    discount: 'Worth $100'
  },
  {
    id: 'ethglobal-plus-discount',
    name: 'EthGlobal Plus 50% Discount',
    description: 'Get 50% off EthGlobal Plus membership for enhanced hackathon perks',
    cost: 3000,
    icon: <Star className="w-6 h-6" />,
    category: 'events',
    available: false,
    image: 'https://ethglobal.com/_next/image?url=https:%2F%2Fethglobal.storage%2Fstatic%2Fplus%2Fethglobal-plus-logo.jpg&w=3840&q=75',
    features: [
      'Priority hackathon spots',
      'Exclusive workshops',
      'Mentor access',
      'Premium support'
    ],
    discount: 'Save $400'
  },
  {
    id: 'crypto-course',
    name: 'Web3 Development Course',
    description: 'Complete Web3 development course with certification',
    cost: 5000,
    icon: <CreditCard className="w-6 h-6" />,
    category: 'crypto',
    available: false,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/2048px-Ethereum-icon-purple.svg.png',
    features: [
      '40+ hours of content',
      'Hands-on projects',
      'Certificate of completion',
      'Lifetime access'
    ]
  }
]

const categories = [
  { id: 'all', name: 'All Rewards', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'merits', name: 'Merits', icon: <Zap className="w-4 h-4" /> },
  { id: 'vouchers', name: 'Gift Cards', icon: <Gift className="w-4 h-4" /> },
  { id: 'events', name: 'Events', icon: <Ticket className="w-4 h-4" /> },
  { id: 'crypto', name: 'Crypto', icon: <CreditCard className="w-4 h-4" /> }
]

export function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [userKarma, setUserKarma] = useState(450) // Mock user karma - in real app this would come from context/props
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(reward => reward.category === selectedCategory)

  const handleRedeemClick = (reward: Reward) => {
    if (!reward.available) {
      return
    }
    
    setSelectedReward(reward)
    setIsModalOpen(true)
  }

  const handleConfirmRedeem = (reward: Reward) => {
    // Deduct karma points
    setUserKarma(prev => prev - reward.cost)
    
    // Here you would typically call an API to process the redemption
    console.log(`Redeemed ${reward.name} for ${reward.cost} karma`)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedReward(null)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'vouchers': return 'badge-primary'
      case 'events': return 'badge-secondary'
      case 'crypto': return 'badge-accent'
      case 'merits': return 'badge-success'
      default: return 'badge-neutral'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold karma-gradient mb-2">Karma Shop</h1>
            <p className="text-neutral/70">Redeem your karma points for amazing rewards</p>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Star className="w-8 h-8" />
              </div>
              <div className="stat-title">Your Karma</div>
              <div className="stat-value text-primary karma-gradient">{userKarma}</div>
              <div className="stat-desc">Available to spend</div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`btn ${selectedCategory === category.id ? 'btn-primary' : 'btn-outline'} btn-sm`}
            >
              {category.icon}
              <span className="ml-2">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredRewards.map((reward) => (
          <div 
            key={reward.id} 
            className={`card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 ${!reward.available ? 'opacity-75' : ''} card-compact`}
          >
            {/* Image Header - Made Larger */}
            <div className="relative h-40 bg-gradient-to-br from-base-200 to-base-300 rounded-t-2xl flex items-center justify-center overflow-hidden">
              {reward.image ? (
                <img 
                  src={reward.image} 
                  alt={reward.name}
                  className="h-24 w-24 object-contain"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    e.currentTarget.style.display = 'none'
                    const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement
                    if (fallbackDiv) {
                      fallbackDiv.classList.remove('hidden')
                    }
                  }}
                />
              ) : null}
              <div className={`p-6 rounded-lg ${reward.available ? 'bg-primary/10 text-primary' : 'bg-base-200 text-base-content/50'} ${reward.image ? 'hidden' : ''}`}>
                {reward.icon}
              </div>
              
              {/* Discount Badge */}
              {reward.discount && (
                <div className="absolute top-2 right-2 badge badge-error badge-sm">
                  {reward.discount}
                </div>
              )}
              
              {/* Coming Soon Badge */}
              {!reward.available && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-warning/90 text-warning-content px-2 py-1 rounded-full text-xs">
                  <Clock className="w-3 h-3" />
                  <span>Coming Soon</span>
                </div>
              )}
            </div>

            <div className="card-body p-4">
              {/* Header */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="card-title text-base">{reward.name}</h3>
                  <div className={`badge ${getCategoryColor(reward.category)} badge-xs`}>
                    {reward.category}
                  </div>
                </div>
                <p className="text-neutral/70 text-xs">{reward.description}</p>
              </div>

              {/* Features - Condensed */}
              {reward.features && (
                <div className="mb-3">
                  <h4 className="font-semibold text-xs mb-1">Features:</h4>
                  <ul className="space-y-0.5">
                    {reward.features.slice(0, 2).map((feature, index) => (
                      <li key={index} className="flex items-center gap-1 text-xs text-neutral/70">
                        <Check className="w-2.5 h-2.5 text-success flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {reward.features.length > 2 && (
                      <li className="text-xs text-neutral/60">
                        +{reward.features.length - 2} more
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Cost */}
              <div className="mb-3">
                <div className="text-xl font-bold karma-gradient">{reward.cost}</div>
                <div className="text-xs text-neutral/60">Karma Points</div>
              </div>

              {/* Actions */}
              <div className="card-actions justify-end">
                {reward.externalLink && (
                  <button 
                    onClick={() => window.open(reward.externalLink, '_blank')}
                    className="btn btn-ghost btn-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => handleRedeemClick(reward)}
                  disabled={!reward.available || userKarma < reward.cost}
                  className={`btn btn-xs ${
                    !reward.available 
                      ? 'btn-disabled' 
                      : userKarma < reward.cost
                        ? 'btn-outline btn-error'
                        : 'btn-primary'
                  }`}
                >
                  {!reward.available 
                    ? 'Soon'
                    : userKarma < reward.cost
                      ? 'Need More'
                      : 'Redeem'
                  }
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRewards.length === 0 && (
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 text-neutral/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral/60 mb-2">No rewards in this category</h3>
          <p className="text-neutral/50">Check back later for new rewards!</p>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 card bg-gradient-to-r from-primary/5 to-secondary/5 shadow-lg">
        <div className="card-body">
          <h3 className="card-title">How it works</h3>
          <div className="grid md:grid-cols-3 gap-6 mt-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Earn Karma</h4>
              <p className="text-sm text-neutral/70">Complete good deeds and verify them to earn Karma points</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-6 h-6 text-secondary" />
              </div>
              <h4 className="font-semibold mb-2">Browse Rewards</h4>
              <p className="text-sm text-neutral/70">Choose from vouchers, event tickets, and blockchain perks</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-semibold mb-2">Redeem & Enjoy</h4>
              <p className="text-sm text-neutral/70">Exchange your points for real-world rewards and benefits</p>
            </div>
          </div>
        </div>
      </div>

      {selectedReward && (
        <RedemptionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirmRedeem={handleConfirmRedeem}
          reward={selectedReward}
          userKarma={userKarma}
        />
      )}
    </div>
  )
} 