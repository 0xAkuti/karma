'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Upload, Zap, Gift, CheckCircle, AlertCircle, ExternalLink, Twitter, RefreshCw, Share2, Copy, Eye, Clock, Check, X } from 'lucide-react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useAccount, useChainId } from 'wagmi'
import { useSetActiveWallet } from '@privy-io/wagmi'
import { EmailProofUpload } from './EmailProofUpload'
import { EmailProofResult } from '@/lib/vlayer'
import { mintKarmaNFT, MintNFTResult, generateBlockscoutUrls, generateTwitterShareUrl, getTargetChain, requestChainSwitch, getContractAddresses } from '@/lib/karma-contracts'
import { useNotification } from '@blockscout/app-sdk'
import { useTransactionStatus } from '@/hooks/useTransactionStatus'
import { useNFTDetails } from '@/hooks/useNFTDetails'

type ClaimStep = 'instructions' | 'upload' | 'processing' | 'proof' | 'minting' | 'complete'

export function WikipediaClaim() {
  const { user, ready: privyReady, authenticated } = usePrivy()
  const { isConnected } = useAccount()
  const { wallets } = useWallets()
  const { setActiveWallet } = useSetActiveWallet()
  const currentChainId = useChainId()
  const { openTxToast } = useNotification()
  
  const [currentStep, setCurrentStep] = useState<ClaimStep>('instructions')
  const [emailProofResult, setEmailProofResult] = useState<EmailProofResult | null>(null)
  const [mintResult, setMintResult] = useState<MintNFTResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSwitchingChain, setIsSwitchingChain] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Transaction status tracking
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '545'
  const { status: txStatus, isPolling } = useTransactionStatus(
    mintResult?.transactionHash || null, 
    chainId
  )
  
  // NFT details fetching - get contract address from config
  const contracts = getContractAddresses()
  const { nftDetails, isLoading: isLoadingNFT, error: nftError } = useNFTDetails(
    mintResult ? contracts.karmaNFT : null,
    mintResult?.tokenId || null
  )

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-progress to complete step when transaction is successful
  useEffect(() => {
    if (txStatus.status === 'success' && currentStep === 'minting') {
      // Give more time for the toast notification and let user manually proceed
      // Remove auto-progression for now - let users click the button
      console.log('Transaction successful, showing View NFT button')
    }
  }, [txStatus.status, currentStep])

  // Get target chain info
  const targetChain = getTargetChain()
  const isOnCorrectChain = mounted && currentChainId === targetChain.id

  // Check if wallet is actually connected (both Privy and wagmi)
  const isWalletConnected = mounted && privyReady && authenticated && isConnected && user?.wallet?.address

  const handleProofGenerated = (result: EmailProofResult) => {
    console.log('Email proof generated:', result)
    setEmailProofResult(result)
    setCurrentStep('proof')
    setError(null)
  }

  const handleError = (errorMessage: string) => {
    console.error('Email proof error:', errorMessage)
    setError(errorMessage)
  }

  const handleSwitchChain = async () => {
    setIsSwitchingChain(true)
    try {
      // First, try to find a wallet on the target chain
      const targetWallet = wallets.find(wallet => 
        wallet.chainId === `eip155:${targetChain.id}`
      )
      
      if (targetWallet) {
        // Switch to the wallet on the target chain
        console.log('Switching to wallet on target chain:', targetWallet)
        await setActiveWallet(targetWallet)
      } else {
        // Fallback to manual chain switching for external wallets
        console.log('No wallet on target chain found, trying manual switch...')
        await requestChainSwitch(targetChain.id)
      }
    } catch (error: any) {
      console.error('Chain switch error:', error)
      setError(`Failed to switch to ${targetChain.name}. Please switch manually in your wallet.`)
    } finally {
      setIsSwitchingChain(false)
    }
  }

  const handleMintNFT = async () => {
    if (!emailProofResult || !user?.wallet?.address) {
      setError('Missing required data for minting')
      return
    }

    if (!isOnCorrectChain) {
      setError(`Please switch to ${targetChain.name} network first`)
      return
    }
    
    setCurrentStep('minting')
    setIsProcessing(true)
    
    try {
      console.log('Starting NFT minting process...')
      
      // Mint the Karma NFT using the proof verifier
      const result = await mintKarmaNFT({
        proof: emailProofResult.proof,
        emailHash: emailProofResult.emailHash,
        targetWallet: emailProofResult.targetWallet,
        donationAmount: emailProofResult.donationAmount
      }, user.wallet.address)
      
      console.log('NFT minting successful:', result)
      
      // Show transaction toast notification
      openTxToast(chainId, result.transactionHash)
      
      setMintResult(result)
      setCurrentStep('complete')
    } catch (error: any) {
      console.error('Minting error:', error)
      setError(`Failed to mint NFT: ${error.message}`)
      setCurrentStep('proof') // Go back to proof step
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewOnBlockscout = () => {
    if (!mintResult) return
    
    const urls = generateBlockscoutUrls(mintResult.tokenId, mintResult.transactionHash)
    if (urls.transaction) {
      window.open(urls.transaction, '_blank')
    }
  }

  const handleShareOnTwitter = () => {
    if (!emailProofResult || !mintResult) return
    
    const twitterUrl = generateTwitterShareUrl({
      donationAmount: emailProofResult.donationAmount,
      transactionHash: mintResult.transactionHash,
      tokenId: mintResult.tokenId
    })
    
    window.open(twitterUrl, '_blank')
  }

  const renderNetworkAlert = () => {
    // Don't show anything during hydration
    if (!mounted || !privyReady) {
      return null
    }

    if (!authenticated || !isWalletConnected) {
      return (
        <div className="alert alert-warning mb-6">
          <AlertCircle className="w-5 h-5" />
          <div>
            <h4 className="font-bold">Wallet Not Connected</h4>
            <p className="text-sm">Please connect your wallet using the button in the top right to continue</p>
          </div>
        </div>
      )
    }

    if (!isOnCorrectChain) {
      return (
        <div className="alert alert-error mb-6">
          <AlertCircle className="w-5 h-5" />
          <div>
            <h4 className="font-bold">Wrong Network</h4>
            <p className="text-sm">
              You're on chain ID {currentChainId}, but this app requires {targetChain.name} (Chain ID: {targetChain.id})
            </p>
          </div>
          <button 
            onClick={handleSwitchChain}
            disabled={isSwitchingChain}
            className="btn btn-primary btn-sm"
          >
            {isSwitchingChain ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Switching...
              </>
            ) : (
              `Switch to ${targetChain.name}`
            )}
          </button>
        </div>
      )
    }

    return null
  }

  const renderStepIndicator = () => {
    const steps = [
      { id: 'instructions', label: 'Instructions', icon: FileText },
      { id: 'upload', label: 'Upload', icon: Upload },
      { id: 'processing', label: 'Processing', icon: Zap },
      { id: 'proof', label: 'Proof', icon: CheckCircle },
      { id: 'minting', label: 'Minting', icon: Gift },
      { id: 'complete', label: 'Complete', icon: CheckCircle }
    ]

    const stepOrder = ['instructions', 'upload', 'processing', 'proof', 'minting', 'complete']
    const currentIndex = stepOrder.indexOf(currentStep)

    return (
      <div className="steps w-full mb-12">
        {steps.map((step, index) => {
          const StepIcon = step.icon
          const isActive = stepOrder[index] === currentStep
          const isCompleted = index < currentIndex
          
          return (
            <div 
              key={step.id} 
              className={`step ${isCompleted || isActive ? 'step-primary' : ''}`}
            >
              <div className={`flex flex-col items-center ${isActive ? 'text-primary' : isCompleted ? 'text-primary' : 'text-base-content/50'}`}>
                <StepIcon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{step.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/claim" className="btn btn-ghost btn-circle">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Wikipedia Donation</h1>
          <p className="text-base-content/70">Claim Karma for supporting free knowledge</p>
        </div>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Network Alert */}
      {renderNetworkAlert()}

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mb-6">
          <AlertCircle className="w-5 h-5" />
          <div>
            <h4 className="font-bold">Error</h4>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="btn btn-ghost btn-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step Content */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {currentStep === 'instructions' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-6xl">📚</div>
                <div>
                  <h2 className="card-title text-2xl">Support Wikipedia</h2>
                  <p className="text-base-content/70">
                    Earn Karma points for donating to Wikipedia Foundation
                  </p>
                </div>
              </div>

              <div className="alert alert-info">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <h3 className="font-bold">How it works</h3>
                  <div className="text-sm">
                    After donating to Wikipedia, you'll receive a confirmation email. 
                    Download that email as a .eml file and upload it here for verification using vlayer.xyz zero-knowledge proofs.
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Step 1: Make a Donation</h3>
                <div className="bg-base-200 p-4 rounded-lg">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Visit <a href="https://donate.wikimedia.org" target="_blank" rel="noopener noreferrer" className="link link-primary">donate.wikimedia.org</a></li>
                    <li>Choose your donation amount (any amount eligible for Karma)</li>
                    <li>In the donation message, include your wallet address: <code className="bg-base-300 px-1 rounded text-xs">{user?.wallet?.address || '0x...'}</code></li>
                    <li>Complete the donation process</li>
                    <li>Check your email for the donation confirmation</li>
                  </ol>
                </div>

                <h3 className="text-lg font-semibold">Step 2: Get the .eml File</h3>
                <div className="bg-base-200 p-4 rounded-lg">
                  <div className="space-y-3 text-sm">
                    <p><strong>Gmail:</strong> Open email → Three dots menu → "Show original" → "Download original"</p>
                    <p><strong>Outlook:</strong> Open email → Three dots menu → "View message source" → Save as .eml</p>
                    <p><strong>Apple Mail:</strong> Open email → File menu → "Save As" → Choose "Raw Message Source"</p>
                  </div>
                </div>

                <div className="alert alert-warning">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <h4 className="font-bold">Privacy & Security</h4>
                    <p className="text-sm">
                      vlayer.xyz uses zero-knowledge proofs to verify your donation without exposing personal information. 
                      Only the donation details and your wallet address are verified.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-actions justify-between">
                <a 
                  href="https://donate.wikimedia.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Donate to Wikipedia
                </a>
                <button 
                  onClick={() => setCurrentStep('upload')}
                  className="btn btn-primary"
                >
                  I Have My .eml File
                </button>
              </div>
            </div>
          )}

          {currentStep === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">📧</div>
                <h2 className="card-title text-2xl justify-center">Upload Your Email</h2>
                <p className="text-base-content/70">
                  Upload your Wikipedia donation confirmation email (.eml file) for vlayer verification
                </p>
              </div>

              <EmailProofUpload 
                onProofGenerated={handleProofGenerated}
                onError={handleError}
                disabled={isProcessing}
              />

              <div className="card-actions justify-between">
                <button 
                  onClick={() => setCurrentStep('instructions')}
                  className="btn btn-ghost"
                  disabled={isProcessing}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {currentStep === 'proof' && emailProofResult && (
            <div className="space-y-6 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="card-title text-2xl justify-center">Proof Generated!</h2>
              <p className="text-base-content/70">
                Your email has been successfully verified using vlayer.xyz
              </p>

              <div className="bg-base-200 p-4 rounded-lg max-w-md mx-auto">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Donation Amount:</span>
                    <span className="text-primary">{emailProofResult.donationAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Target Wallet:</span>
                    <span className="font-mono text-xs">{emailProofResult.targetWallet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Verification:</span>
                    <span className="text-success flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="alert alert-success max-w-md mx-auto">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <h4 className="font-bold">Zero-Knowledge Proof Generated</h4>
                  <p className="text-sm">
                    Your email verification proof is ready for on-chain minting
                  </p>
                </div>
              </div>

              <div className="card-actions justify-center">
                <button 
                  onClick={handleMintNFT}
                  disabled={isProcessing || !user?.wallet?.address || !isWalletConnected || !isOnCorrectChain}
                  className="btn btn-primary btn-lg"
                >
                  <Gift className="w-5 h-5" />
                  Mint Karma NFT
                </button>
              </div>

              {!isWalletConnected && mounted && (
                <div className="alert alert-warning max-w-md mx-auto">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <h4 className="font-bold">Wallet Required</h4>
                    <p className="text-sm">Please connect your wallet using the button in the top right to mint the NFT</p>
                  </div>
                </div>
              )}

              {isWalletConnected && !isOnCorrectChain && mounted && (
                <div className="alert alert-error max-w-md mx-auto">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <h4 className="font-bold">Wrong Network</h4>
                    <p className="text-sm">Please switch to {targetChain.name} to mint the NFT</p>
                  </div>
                  <button 
                    onClick={handleSwitchChain}
                    disabled={isSwitchingChain}
                    className="btn btn-primary btn-sm"
                  >
                    {isSwitchingChain ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Switching...
                      </>
                    ) : (
                      `Switch to ${targetChain.name}`
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === 'minting' && (
            <div className="space-y-6 text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h2 className="card-title text-2xl justify-center">Minting Your NFT</h2>
              
              {/* Transaction Status Display */}
              {mintResult ? (
                <div className="space-y-4">
                  <p className="text-base-content/70">
                    Transaction submitted! Tracking status using Blockscout API...
                  </p>
                  
                  {/* Transaction Hash */}
                  <div className="max-w-md mx-auto bg-base-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Transaction:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs">{mintResult.transactionHash.slice(0, 8)}...{mintResult.transactionHash.slice(-6)}</code>
                        <button
                          onClick={() => window.open(mintResult.blockscoutUrl, '_blank')}
                          className="btn btn-xs btn-ghost"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="flex flex-col items-center space-y-3">
                    {txStatus.status === 'pending' && (
                      <>
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <div className="flex items-center gap-2 text-warning">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Transaction pending...</span>
                        </div>
                        {txStatus.confirmations !== undefined && (
                          <div className="text-xs text-base-content/60">
                            Confirmations: {txStatus.confirmations}
                          </div>
                        )}
                      </>
                    )}
                    
                    {txStatus.status === 'success' && (
                      <>
                        <div className="text-success text-4xl">✅</div>
                        <div className="flex items-center gap-2 text-success">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">Transaction confirmed!</span>
                        </div>
                        {txStatus.confirmations && (
                          <div className="text-xs text-base-content/60">
                            Block: {txStatus.blockNumber} • Confirmations: {txStatus.confirmations}
                          </div>
                        )}
                        {txStatus.gasUsed && (
                          <div className="text-xs text-base-content/60">
                            Gas used: {parseInt(txStatus.gasUsed).toLocaleString()}
                          </div>
                        )}
                      </>
                    )}
                    
                    {txStatus.status === 'error' && (
                      <>
                        <div className="text-error text-4xl">❌</div>
                        <div className="flex items-center gap-2 text-error">
                          <X className="w-4 h-4" />
                          <span className="text-sm font-medium">Transaction failed</span>
                        </div>
                        {txStatus.error && (
                          <div className="alert alert-error max-w-md mx-auto">
                            <AlertCircle className="w-4 h-4" />
                            <div className="text-left">
                              <div className="font-medium text-sm">Error Details:</div>
                              <div className="text-xs">{txStatus.error}</div>
                              {txStatus.revertReason && (
                                <div className="text-xs mt-1">
                                  <span className="font-medium">Revert reason:</span> {txStatus.revertReason}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    {txStatus.status === 'not_found' && (
                      <>
                        <span className="loading loading-spinner loading-md text-warning"></span>
                        <div className="flex items-center gap-2 text-warning">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Waiting for transaction to appear...</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Auto-progress to complete when successful */}
                  {txStatus.status === 'success' && (
                    <div className="pt-4">
                      <button 
                        onClick={() => setCurrentStep('complete')}
                        className="btn btn-primary"
                      >
                        View Your NFT
                      </button>
                    </div>
                  )}
                  
                  {/* Retry button on error */}
                  {txStatus.status === 'error' && (
                    <div className="pt-4">
                      <button 
                        onClick={() => {
                          setMintResult(null)
                          setCurrentStep('proof')
                        }}
                        className="btn btn-outline"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-base-content/70">
                    Creating your soulbound Karma NFT with vlayer proof verification...
                  </p>
                  <div className="flex flex-col items-center space-y-4">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <div className="text-sm text-base-content/60">
                      Submitting proof to KarmaProofVerifier contract...
                    </div>
                  </div>
                </div>
              )}

              {emailProofResult && (
                <div className="max-w-sm mx-auto">
                  <div className="card bg-gradient-to-br from-primary/20 to-secondary/20">
                    <div className="card-body items-center">
                      <div className="text-4xl mb-2">📚</div>
                      <h3 className="card-title text-lg">Donation Amount Verified</h3>
                      <p className="text-center text-sm">{emailProofResult.donationAmount}</p>
                      <div className="badge badge-primary badge-sm">Soulbound NFT</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 'complete' && emailProofResult && mintResult && (
            <div className="space-y-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="card-title text-2xl justify-center">Congratulations!</h2>
              <p className="text-base-content/70">
                Your Karma NFT has been successfully minted with vlayer verification
              </p>

              {/* NFT Display */}
              <div className="max-w-lg mx-auto">
                {isLoadingNFT ? (
                  <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30">
                    <div className="card-body items-center">
                      <span className="loading loading-spinner loading-md"></span>
                      <p className="text-sm">Loading NFT details from Blockscout...</p>
                    </div>
                  </div>
                ) : nftError ? (
                  <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30">
                    <div className="card-body items-center">
                      <div className="text-4xl mb-2">📚</div>
                      <h3 className="card-title text-lg">Karma NFT #{mintResult.tokenId.slice(0, 8)}...</h3>
                      <p className="text-center text-sm mb-2">{emailProofResult.donationAmount} Donation</p>
                      <div className="flex gap-2">
                        <div className="badge badge-primary badge-sm">Soulbound NFT</div>
                        <div className="badge badge-success badge-sm">vlayer Verified</div>
                      </div>
                      <div className="text-xs text-warning mt-2">
                        ⚠️ Could not load metadata from Blockscout
                      </div>
                    </div>
                  </div>
                ) : nftDetails ? (
                  <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30">
                    <div className="card-body items-center">
                      {/* NFT Image */}
                      {nftDetails.image ? (
                        <img 
                          src={nftDetails.image} 
                          alt={nftDetails.name}
                          className="w-32 h-32 rounded-lg object-cover mb-4"
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`text-4xl mb-2 ${nftDetails.image ? 'hidden' : ''}`}>📚</div>
                      
                      {/* NFT Details */}
                      <h3 className="card-title text-lg">{nftDetails.name}</h3>
                      <p className="text-center text-sm mb-2">{nftDetails.description}</p>
                      
                      {/* Donation Amount */}
                      <div className="bg-primary/10 px-3 py-1 rounded-full mb-2">
                        <span className="text-sm font-medium">{emailProofResult.donationAmount} Donation</span>
                      </div>
                      
                      {/* Badges */}
                      <div className="flex gap-2 mb-3">
                        <div className="badge badge-primary badge-sm">Soulbound NFT</div>
                        <div className="badge badge-success badge-sm">vlayer Verified</div>
                        <div className="badge badge-info badge-sm">Blockscout Verified</div>
                      </div>
                      
                      {/* NFT Attributes */}
                      {nftDetails.attributes && nftDetails.attributes.length > 0 && (
                        <div className="w-full">
                          <h4 className="text-sm font-medium mb-2">Attributes</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {nftDetails.attributes.map((attr, index) => (
                              <div key={index} className="bg-base-200 p-2 rounded text-xs">
                                <div className="font-medium">{attr.trait_type}</div>
                                <div className="text-base-content/70">{attr.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Technical Details */}
                      <div className="text-xs text-base-content/60 mt-3 space-y-1">
                        <div>Token ID: {mintResult.tokenId.slice(0, 8)}...{mintResult.tokenId.slice(-6)}</div>
                        <div>Contract: {contracts.karmaNFT.slice(0, 6)}...{contracts.karmaNFT.slice(-4)}</div>
                        <div>Wallet: {emailProofResult.targetWallet.slice(0, 6)}...{emailProofResult.targetWallet.slice(-4)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30">
                    <div className="card-body items-center">
                      <div className="text-4xl mb-2">📚</div>
                      <h3 className="card-title text-lg">Karma NFT</h3>
                      <p className="text-center text-sm mb-2">{emailProofResult.donationAmount} Donation</p>
                      <div className="flex gap-2 mb-3">
                        <div className="badge badge-primary badge-sm">Soulbound NFT</div>
                        <div className="badge badge-success badge-sm">vlayer Verified</div>
                      </div>
                      <div className="text-xs text-base-content/60 mt-2 space-y-1">
                        <div>Token ID: {mintResult.tokenId.slice(0, 8)}...{mintResult.tokenId.slice(-6)}</div>
                        <div>Contract: {contracts.karmaNFT.slice(0, 6)}...{contracts.karmaNFT.slice(-4)}</div>
                        <div>Wallet: {emailProofResult.targetWallet.slice(0, 6)}...{emailProofResult.targetWallet.slice(-4)}</div>
                      </div>
                      
                      {/* Debug info - temporarily show the full values */}
                      <div className="bg-warning/10 p-2 rounded mt-3 text-xs">
                        <div className="font-medium text-warning mb-1">Debug Info:</div>
                        <div>Contract: {contracts.karmaNFT}</div>
                        <div>Token ID: {mintResult.tokenId}</div>
                        <div>NFT Error: {nftError}</div>
                        <div>Loading: {isLoadingNFT ? 'Yes' : 'No'}</div>
                        
                        {nftError && (
                          <div className="mt-2">
                            <button 
                              onClick={() => {
                                console.log('Retrying NFT details fetch...')
                                // Get the refetch function from the hook
                                if (window.location.reload) {
                                  window.location.reload()
                                }
                              }}
                              className="btn btn-xs btn-warning"
                            >
                              Retry Fetch
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="alert alert-info text-xs mt-3">
                        <div>
                          <div className="font-medium">Note:</div>
                          <div>NFT metadata may take a few minutes to appear on Blockscout after minting.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="alert alert-info max-w-md mx-auto">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <h4 className="font-bold">NFT Details</h4>
                  <p className="text-sm">
                    Your soulbound NFT represents your verified email proof for donation of {emailProofResult.donationAmount}. 
                    It cannot be transferred and serves as permanent proof of verification.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleViewOnBlockscout}
                  className="btn btn-outline btn-wide"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Blockscout
                </button>
                
                <div className="divider">Share your achievement</div>
                
                <button 
                  onClick={handleShareOnTwitter}
                  className="btn btn-primary btn-outline"
                >
                  <Twitter className="w-4 h-4" />
                  Share on Twitter
                </button>
              </div>

              <div className="card-actions justify-center">
                <Link href="/dashboard" className="btn btn-primary">
                  Return to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 