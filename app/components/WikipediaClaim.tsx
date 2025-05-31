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
  const { nftDetails, isLoading: isLoadingNFT, error: nftError, retryCount, maxRetries, refetch } = useNFTDetails(
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
                    <div className="text-lg font-semibold text-primary">
                      Donation Amount: ${emailProofResult.donationAmount}
                    </div>
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
                    
                    {/* Show karma tokens amount if available */}
                    {mintResult.karmaTokensAmount && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-base-300">
                        <span className="text-sm font-medium">Karma Tokens:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-primary">{mintResult.karmaTokensAmount}</span>
                          <span className="text-xs text-base-content/60">KARMA</span>
                        </div>
                      </div>
                    )}
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
                        <div className="text-xs text-base-content/50 max-w-md">
                          Once confirmed, your NFT will be minted and karma tokens will be distributed to your wallet.
                        </div>
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
                        
                        {/* Show success details with karma tokens */}
                        <div className="alert alert-success max-w-md mx-auto">
                          <CheckCircle className="w-5 h-5" />
                          <div className="text-left text-sm">
                            <div className="font-medium">Minting Successful!</div>
                            <div>• NFT created and assigned to your wallet</div>
                            {mintResult.karmaTokensAmount && (
                              <div>• {mintResult.karmaTokensAmount} KARMA tokens distributed</div>
                            )}
                            <div>• Proof verified using vlayer technology</div>
                          </div>
                        </div>
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
                        <div className="text-xs text-base-content/50 max-w-md">
                          This is normal for new transactions. It may take a few moments to appear on the blockchain.
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
                        View Your NFT & Details
                      </button>
                    </div>
                  )}
                  
                  {/* Retry button on error */}
                  {txStatus.status === 'error' && (
                    <div className="pt-4 space-y-2">
                      <button 
                        onClick={() => {
                          setMintResult(null)
                          setCurrentStep('proof')
                          setError(null)
                        }}
                        className="btn btn-outline"
                      >
                        Try Again
                      </button>
                      <div className="text-xs text-base-content/60 max-w-md mx-auto">
                        Common issues: insufficient gas, network congestion, or proof verification failure. 
                        Please check your wallet and try again.
                      </div>
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
                    <div className="text-xs text-base-content/50 max-w-md text-center">
                      Please confirm the transaction in your wallet. This process verifies your donation 
                      email and mints your soulbound NFT with karma token rewards.
                    </div>
                  </div>
                </div>
              )}

              {emailProofResult && (
                <div className="max-w-sm mx-auto">
                  <div className="card bg-gradient-to-br from-primary/20 to-secondary/20">
                    <div className="card-body items-center">
                      <div className="text-4xl mb-2">📚</div>
                      <h3 className="card-title text-lg">Donation Verified</h3>
                      <p className="text-center text-sm font-semibold">${emailProofResult.donationAmount}</p>
                      <div className="flex gap-1 mt-2">
                        <div className="badge badge-primary badge-sm">Soulbound NFT</div>
                        <div className="badge badge-secondary badge-sm">+10 KARMA</div>
                      </div>
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

              {/* Karma Token Reward Display */}
              {mintResult.karmaTokensAmount && (
                <div className="alert alert-success max-w-md mx-auto">
                  <Gift className="w-5 h-5" />
                  <div>
                    <h4 className="font-bold">Karma Tokens Earned!</h4>
                    <p className="text-sm">
                      You received <span className="font-bold text-primary">{mintResult.karmaTokensAmount} KARMA tokens</span> for your ${emailProofResult.donationAmount} donation
                    </p>
                  </div>
                </div>
              )}

              {/* NFT Display */}
              <div className="max-w-lg mx-auto">
                {isLoadingNFT ? (
                  <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30">
                    <div className="card-body items-center">
                      <span className="loading loading-spinner loading-md"></span>
                      <p className="text-sm">Loading NFT details from Blockscout...</p>
                      <div className="text-xs text-base-content/60 mt-2">
                        This may take a few moments after minting
                      </div>
                      {retryCount > 0 && (
                        <div className="text-xs text-primary mt-1">
                          Retry attempt {retryCount}/{maxRetries}
                        </div>
                      )}
                    </div>
                  </div>
                ) : nftError ? (
                  <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30">
                    <div className="card-body items-center">
                      <div className="text-4xl mb-2">📚</div>
                      <h3 className="card-title text-lg">Karma NFT #{mintResult.tokenId.slice(0, 8)}...</h3>
                      <p className="text-center text-sm mb-2">${emailProofResult.donationAmount} Donation</p>
                      
                      {/* Karma tokens display even without metadata */}
                      {mintResult.karmaTokensAmount && (
                        <div className="bg-primary/10 px-3 py-1 rounded-full mb-2">
                          <div className="text-sm font-semibold text-primary">
                            +{mintResult.karmaTokensAmount} KARMA Tokens
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mb-3">
                        <div className="badge badge-primary badge-sm">Soulbound NFT</div>
                        <div className="badge badge-success badge-sm">vlayer Verified</div>
                      </div>
                      
                      <div className="alert alert-warning text-xs mt-3">
                        <AlertCircle className="w-4 h-4" />
                        <div>
                          <div className="font-medium">Metadata Loading</div>
                          <div>NFT metadata may take a few minutes to appear on Blockscout after minting.</div>
                          {retryCount > 0 && retryCount < maxRetries && (
                            <div className="mt-1">
                              Auto-retrying... (attempt {retryCount}/{maxRetries})
                            </div>
                          )}
                          {retryCount >= maxRetries && (
                            <div className="mt-1 text-warning">
                              Auto-retry limit reached. You can manually retry or check back later.
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Manual retry button */}
                      <div className="mt-3">
                        <button 
                          onClick={refetch}
                          className="btn btn-xs btn-outline"
                          disabled={isLoadingNFT}
                        >
                          {isLoadingNFT ? (
                            <>
                              <span className="loading loading-spinner loading-xs"></span>
                              Loading...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3" />
                              Retry Metadata
                            </>
                          )}
                        </button>
                      </div>
                      
                      {/* Technical Details */}
                      <div className="text-xs text-base-content/60 mt-3 space-y-1">
                        <div>Token ID: {mintResult.tokenId.slice(0, 8)}...{mintResult.tokenId.slice(-6)}</div>
                        <div>Contract: {contracts.karmaNFT.slice(0, 6)}...{contracts.karmaNFT.slice(-4)}</div>
                        <div>Wallet: {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}</div>
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
                        <div className="text-lg font-semibold text-primary">
                          Donation: ${emailProofResult.donationAmount}
                        </div>
                      </div>
                      
                      {/* Karma tokens display */}
                      {mintResult.karmaTokensAmount && (
                        <div className="bg-secondary/10 px-3 py-1 rounded-full mb-2">
                          <div className="text-lg font-semibold text-secondary">
                            +{mintResult.karmaTokensAmount} KARMA Tokens
                          </div>
                        </div>
                      )}
                      
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
                        <div>Wallet: {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30">
                    <div className="card-body items-center">
                      <div className="text-4xl mb-2">📚</div>
                      <h3 className="card-title text-lg">Karma NFT</h3>
                      <p className="text-center text-sm mb-2">${emailProofResult.donationAmount} Donation</p>
                      
                      {/* Karma tokens display */}
                      {mintResult.karmaTokensAmount && (
                        <div className="bg-secondary/10 px-3 py-1 rounded-full mb-2">
                          <div className="text-lg font-semibold text-secondary">
                            +{mintResult.karmaTokensAmount} KARMA Tokens
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mb-3">
                        <div className="badge badge-primary badge-sm">Soulbound NFT</div>
                        <div className="badge badge-success badge-sm">vlayer Verified</div>
                      </div>
                      <div className="text-xs text-base-content/60 mt-2 space-y-1">
                        <div>Token ID: {mintResult.tokenId.slice(0, 8)}...{mintResult.tokenId.slice(-6)}</div>
                        <div>Contract: {contracts.karmaNFT.slice(0, 6)}...{contracts.karmaNFT.slice(-4)}</div>
                        <div>Wallet: {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}</div>
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
                    Your soulbound NFT represents your verified donation of ${emailProofResult.donationAmount} to Wikipedia.
                    {mintResult.karmaTokensAmount && (
                      <> You also earned {mintResult.karmaTokensAmount} KARMA tokens as a reward for your contribution.</>
                    )}
                    It cannot be transferred and serves as permanent proof of your good deed.
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