'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Gift, Star, Clock, Check, ExternalLink, Zap, Coffee, Ticket, CreditCard, UserPlus, AlertTriangle, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { usePrivy, useSignMessage } from '@privy-io/react-auth'
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

interface BlockscoutUser {
  exists: boolean
  user?: {
    address: string
    total_balance: string
    referrals: string
    registered_at: string
  }
}

interface NonceResponse {
  nonce: string
  merits_login_nonce: string | null
}

interface LoginResponse {
  created: boolean
  token: string
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

// Blockscout Merits API configuration
const MERITS_API_BASE = 'https://merits-staging.blockscout.com'
const PARTNER_API_KEY = process.env.NEXT_PUBLIC_BLOCKSCOUT_API_KEY || 'demo-key'

export function Shop() {
  const { ready, authenticated, user } = usePrivy()
  const { signMessage } = useSignMessage({
    onSuccess: (result) => {
      console.log('Message signed successfully:', result)
    },
    onError: (error) => {
      console.error('Failed to sign message:', error)
      setMeritsError('Failed to sign message. Please try again.')
      setIsSigningUp(false)
    }
  })
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [userKarma, setUserKarma] = useState(450) // Mock user karma - in real app this would come from context/props
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [blockscoutUser, setBlockscoutUser] = useState<BlockscoutUser | null>(null)
  const [isLoadingMerits, setIsLoadingMerits] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [meritsError, setMeritsError] = useState<string | null>(null)
  const [meritsSuccess, setMeritsSuccess] = useState<string | null>(null)
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'invalid'>('checking')

  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(reward => reward.category === selectedCategory)

  // Handle hydration
  useEffect(() => {
    setIsMounted(true)
    checkApiKey()
  }, [])

  // Get user address from Privy
  const userAddress = authenticated && user?.wallet?.address ? user.wallet.address : ''

  // Check Blockscout user when wallet connects
  useEffect(() => {
    if (userAddress && isMounted && apiKeyStatus === 'valid') {
      checkBlockscoutUser(userAddress)
    }
  }, [userAddress, isMounted, apiKeyStatus])

  // Clear success message after 5 seconds
  useEffect(() => {
    if (meritsSuccess) {
      const timer = setTimeout(() => {
        setMeritsSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [meritsSuccess])

  // Check if API key is valid
  const checkApiKey = async () => {
    try {
      const response = await fetch(`${MERITS_API_BASE}/partner/api/v1/balance`, {
        headers: {
          'Authorization': PARTNER_API_KEY
        }
      })
      
      if (response.ok) {
        setApiKeyStatus('valid')
      } else {
        setApiKeyStatus('invalid')
        setMeritsError('Invalid API key. Please contact support for Blockscout Merits integration.')
      }
    } catch (error) {
      setApiKeyStatus('invalid')
      setMeritsError('Unable to connect to Blockscout Merits API.')
    }
  }

  // Check if user exists in Blockscout Merits system
  const checkBlockscoutUser = async (address: string) => {
    setIsLoadingMerits(true)
    setMeritsError(null)
    try {
      const response = await fetch(`${MERITS_API_BASE}/api/v1/auth/user/${address}`)
      
      if (response.ok) {
        const userData: BlockscoutUser = await response.json()
        setBlockscoutUser(userData)
        
        if (!userData.exists) {
          setMeritsError('You need to sign up for Blockscout Merits first to receive rewards.')
        }
      } else {
        throw new Error(`API Error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error checking Blockscout user:', error)
      setMeritsError('Unable to check Blockscout Merits account.')
    } finally {
      setIsLoadingMerits(false)
    }
  }

  // Get nonce for authentication
  const getNonce = async (): Promise<NonceResponse> => {
    const response = await fetch(`${MERITS_API_BASE}/api/v1/auth/nonce`)
    if (!response.ok) {
      throw new Error(`Failed to get nonce: ${response.statusText}`)
    }
    return response.json()
  }

  // Sign up for Blockscout Merits directly in our app
  const handleSignUpForMerits = async () => {
    if (!userAddress) {
      setMeritsError('Please ensure your wallet is connected.')
      return
    }

    setIsSigningUp(true)
    setMeritsError(null)
    setMeritsSuccess(null)
    
    try {
      // Step 1: Get nonce
      const { nonce } = await getNonce()

      // Step 2: Create the exact SIWE message format that Blockscout expects
      const currentTime = new Date().toISOString()
      const expirationTime = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      
      const message = `merits.blockscout.com wants you to sign in with your Ethereum account:
${userAddress}

Sign-In for the Blockscout Merits program.

URI: https://merits.blockscout.com
Version: 1
Chain ID: 1
Nonce: ${nonce}
Issued At: ${currentTime}
Expiration Time: ${expirationTime}`

      // Step 3: Sign the message using Privy's useSignMessage hook
      const signature = await signMessage(message)

      // Step 4: Login/Register with Blockscout
      const loginResponse = await fetch(`${MERITS_API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nonce,
          message,
          signature
        })
      })

      if (!loginResponse.ok) {
        const errorText = await loginResponse.text()
        throw new Error(`Login failed: ${loginResponse.status} - ${errorText}`)
      }

      const loginData: LoginResponse = await loginResponse.json()

      // Success! User is now registered/logged in
      if (loginData.created) {
        setMeritsSuccess('🎉 Successfully signed up for Blockscout Merits! You may receive some welcome Merits.')
      } else {
        setMeritsSuccess('✅ Successfully logged into Blockscout Merits!')
      }

      // Refresh user data
      await checkBlockscoutUser(userAddress)

    } catch (error) {
      console.error('Error signing up for Blockscout Merits:', error)
      setMeritsError(`Failed to sign up: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSigningUp(false)
    }
  }

  // Distribute Merits to user (actual API call)
  const distributeBlockscoutMerits = async (address: string, amount: number) => {
    if (apiKeyStatus !== 'valid') {
      throw new Error('API key not configured properly')
    }

    try {
      const distributionData = {
        id: `karma_shop_redemption_${Date.now()}`,
        description: `Karma Shop: Converted ${amount / 2} Karma to ${amount} Blockscout Merits`,
        distributions: [
          {
            address: address,
            amount: amount.toString()
          }
        ],
        create_missing_accounts: true, // Allow distribution for non-registered accounts
        expected_total: amount.toString()
      }

      const response = await fetch(`${MERITS_API_BASE}/partner/api/v1/distribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': PARTNER_API_KEY
        },
        body: JSON.stringify(distributionData)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Distribution failed: ${response.status} - ${errorData}`)
      }

      const result = await response.json()
      console.log('Merits distributed successfully:', result)
      return result
    } catch (error) {
      console.error('Error distributing Blockscout Merits:', error)
      throw error
    }
  }

  const handleRedeemClick = (reward: Reward) => {
    if (!reward.available) {
      return
    }
    
    // For Blockscout Merits, check if user is registered
    if (reward.id === 'blockscout-merits') {
      if (!userAddress) {
        setMeritsError('Please connect your wallet first.')
        return
      }
      
      if (apiKeyStatus !== 'valid') {
        setMeritsError('Blockscout Merits integration is not configured properly.')
        return
      }
      
      if (blockscoutUser && !blockscoutUser.exists) {
        // Don't show alert - the UI already has a signup button
        return
      }
    }
    
    setSelectedReward(reward)
    setIsModalOpen(true)
  }

  const handleConfirmRedeem = async (reward: Reward) => {
    // Deduct karma points
    setUserKarma(prev => prev - reward.cost)
    
    // If it's Blockscout Merits and user has connected wallet, make actual API call
    if (reward.id === 'blockscout-merits' && userAddress) {
      try {
        const meritsAmount = reward.cost * 2 // 1 Karma = 2 Merits
        await distributeBlockscoutMerits(userAddress, meritsAmount)
        
        // Show success message
        setMeritsSuccess(`Successfully distributed ${meritsAmount} Blockscout Merits to your wallet!`)
        
        // Refresh user data after successful distribution
        setTimeout(() => {
          checkBlockscoutUser(userAddress)
        }, 2000) // Wait 2 seconds for the distribution to process
        
        console.log(`Successfully distributed ${meritsAmount} Blockscout Merits to ${userAddress}`)
      } catch (error) {
        console.error('Failed to distribute Blockscout Merits:', error)
        // Revert karma deduction on failure
        setUserKarma(prev => prev + reward.cost)
        setMeritsError(`Failed to distribute Blockscout Merits: ${error instanceof Error ? error.message : 'Unknown error'}`)
        return
      }
    }
    
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

  // Don't render until mounted to avoid hydration issues
  if (!isMounted || !ready) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow">
                <div className="h-40 bg-gray-200 rounded-t-2xl"></div>
                <div className="card-body p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
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
          
          {/* Karma Balance Only */}
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

        {/* Success Message */}
        {meritsSuccess && (
          <div className="alert alert-success mb-6">
            <CheckCircle className="w-5 h-5" />
            <div>
              <div className="text-sm">{meritsSuccess}</div>
            </div>
          </div>
        )}

        {/* Blockscout Integration Status */}
        {authenticated && userAddress && apiKeyStatus === 'valid' && (
          <div className={`alert mb-6 ${blockscoutUser?.exists ? 'alert-success' : meritsError ? 'alert-warning' : 'alert-info'}`}>
            <Zap className="w-5 h-5" />
            <div className="flex-1">
              <h3 className="font-bold">
                {blockscoutUser?.exists ? 'Blockscout Merits Connected!' : 'Blockscout Merits Integration'}
              </h3>
              <div className="text-sm">
                {isLoadingMerits ? (
                  'Checking your Blockscout Merits account...'
                ) : blockscoutUser?.exists ? (
                  <>
                    You have <strong>{blockscoutUser.user?.total_balance} Merits</strong> in your account. 
                    <a 
                      href="https://merits-staging.blockscout.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="link link-primary ml-2"
                    >
                      View Dashboard →
                    </a>
                  </>
                ) : (
                  <>
                    {meritsError} Sign up now to start earning Merits!
                  </>
                )}
              </div>
            </div>
            {blockscoutUser && !blockscoutUser.exists && (
              <button 
                onClick={handleSignUpForMerits}
                disabled={isSigningUp}
                className="btn btn-primary btn-sm ml-2"
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Signing Up...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Sign Up for Merits
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* API Key Error */}
        {apiKeyStatus === 'invalid' && (
          <div className="alert alert-error mb-6">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <h3 className="font-bold">Configuration Error</h3>
              <div className="text-sm">
                {meritsError} Blockscout Merits redemption is temporarily unavailable.
              </div>
            </div>
          </div>
        )}

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
        {filteredRewards.map((reward) => {
          const isMeritsReward = reward.id === 'blockscout-merits'
          const canRedeemMerits = isMeritsReward && userAddress && apiKeyStatus === 'valid' && blockscoutUser?.exists
          const needsSignup = isMeritsReward && userAddress && apiKeyStatus === 'valid' && !blockscoutUser?.exists
          
          return (
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

                {/* Real Integration Badge for Merits */}
                {isMeritsReward && apiKeyStatus === 'valid' && (
                  <div className="absolute top-2 left-2 badge badge-success badge-sm">
                    ⚡ Live API
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
                  {isMeritsReward && (
                    <div className="text-xs text-success">= {reward.cost * 2} Merits</div>
                  )}
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
                    disabled={!reward.available || userKarma < reward.cost || (isMeritsReward && !userAddress) || (isMeritsReward && apiKeyStatus !== 'valid') || isSigningUp}
                    className={`btn btn-xs ${
                      !reward.available 
                        ? 'btn-disabled' 
                        : userKarma < reward.cost
                          ? 'btn-outline btn-error'
                          : isMeritsReward && !userAddress
                            ? 'btn-outline btn-warning'
                            : isMeritsReward && apiKeyStatus !== 'valid'
                              ? 'btn-disabled'
                              : needsSignup
                                ? 'btn-outline btn-info'
                                : 'btn-primary'
                    }`}
                  >
                    {!reward.available 
                      ? 'Soon'
                      : userKarma < reward.cost
                        ? 'Need More'
                        : isMeritsReward && !userAddress
                          ? 'Connect Wallet'
                          : isMeritsReward && apiKeyStatus !== 'valid'
                            ? 'Unavailable'
                            : needsSignup
                              ? 'Sign Up First'
                              : 'Redeem'
                    }
                  </button>
                </div>
              </div>
            </div>
          )
        })}
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