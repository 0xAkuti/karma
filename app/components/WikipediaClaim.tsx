'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Upload, Zap, Gift, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

type ClaimStep = 'instructions' | 'upload' | 'processing' | 'proof' | 'minting' | 'complete'

export function WikipediaClaim() {
  const [currentStep, setCurrentStep] = useState<ClaimStep>('instructions')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith('.eml')) {
      setUploadedFile(file)
    } else {
      alert('Please upload a valid .eml file')
    }
  }

  const handleStartProofGeneration = async () => {
    if (!uploadedFile) return
    
    setCurrentStep('processing')
    setIsProcessing(true)
    
    // Simulate proof generation (in real app, this would call vlayer SDK)
    setTimeout(() => {
      setIsProcessing(false)
      setCurrentStep('proof')
    }, 3000)
  }

  const handleMintNFT = async () => {
    setCurrentStep('minting')
    
    // Simulate NFT minting (in real app, this would call smart contract)
    setTimeout(() => {
      setCurrentStep('complete')
    }, 2000)
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
    <div>
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
                    Earn 50-500 Karma points for donating to Wikipedia Foundation
                  </p>
                </div>
              </div>

              <div className="alert alert-info">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <h3 className="font-bold">How it works</h3>
                  <div className="text-sm">
                    After donating to Wikipedia, you'll receive a confirmation email. 
                    Download that email as a .eml file and upload it here for verification.
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Step 1: Make a Donation</h3>
                <div className="bg-base-200 p-4 rounded-lg">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Visit <a href="https://donate.wikimedia.org" target="_blank" rel="noopener noreferrer" className="link link-primary">donate.wikimedia.org</a></li>
                    <li>Choose your donation amount (minimum $5 for Karma eligibility)</li>
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
                    <h4 className="font-bold">Privacy Note</h4>
                    <p className="text-sm">
                      Only the donation confirmation details are verified. Personal information is not stored or shared.
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
                  Upload your Wikipedia donation confirmation email (.eml file)
                </p>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email File (.eml)</span>
                </label>
                <input
                  type="file"
                  accept=".eml"
                  onChange={handleFileUpload}
                  className="file-input file-input-bordered file-input-primary w-full"
                />
                <label className="label">
                  <span className="label-text-alt">Only .eml files are accepted</span>
                </label>
              </div>

              {uploadedFile && (
                <div className="alert alert-success">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <h4 className="font-bold">File Ready</h4>
                    <p className="text-sm">
                      {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  </div>
                </div>
              )}

              <div className="card-actions justify-between">
                <button 
                  onClick={() => setCurrentStep('instructions')}
                  className="btn btn-ghost"
                >
                  Back
                </button>
                <button 
                  onClick={handleStartProofGeneration}
                  disabled={!uploadedFile}
                  className="btn btn-primary"
                >
                  Generate Proof
                </button>
              </div>
            </div>
          )}

          {currentStep === 'processing' && (
            <div className="space-y-6 text-center">
              <div className="text-6xl mb-4">⚡</div>
              <h2 className="card-title text-2xl justify-center">Generating Proof</h2>
              <p className="text-base-content/70">
                Using vlayer.xyz to verify your donation...
              </p>

              <div className="flex flex-col items-center space-y-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <div className="text-sm text-base-content/60">
                  This may take a few moments while we verify your email
                </div>
              </div>

              <div className="space-y-2 text-left max-w-md mx-auto">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Email uploaded successfully
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="loading loading-spinner loading-xs"></span>
                  Verifying donation details...
                </div>
                <div className="flex items-center gap-2 text-sm text-base-content/50">
                  <div className="w-4 h-4"></div>
                  Generating ZK proof
                </div>
              </div>
            </div>
          )}

          {currentStep === 'proof' && (
            <div className="space-y-6 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="card-title text-2xl justify-center">Proof Generated!</h2>
              <p className="text-base-content/70">
                Your Wikipedia donation has been successfully verified
              </p>

              <div className="stats shadow max-w-md mx-auto">
                <div className="stat">
                  <div className="stat-title">Donation Amount</div>
                  <div className="stat-value text-lg">$25.00</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Karma Reward</div>
                  <div className="stat-value text-primary">125 Points</div>
                </div>
              </div>

              <div className="alert alert-success max-w-md mx-auto">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <h4 className="font-bold">Verification Complete</h4>
                  <p className="text-sm">
                    Your donation to Wikipedia Foundation has been verified using zero-knowledge proofs
                  </p>
                </div>
              </div>

              <div className="card-actions justify-center">
                <button 
                  onClick={handleMintNFT}
                  className="btn btn-primary btn-lg"
                >
                  <Gift className="w-5 h-5" />
                  Mint Karma NFT
                </button>
              </div>
            </div>
          )}

          {currentStep === 'minting' && (
            <div className="space-y-6 text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h2 className="card-title text-2xl justify-center">Minting Your NFT</h2>
              <p className="text-base-content/70">
                Creating your soulbound Karma NFT on Flow Testnet...
              </p>

              <div className="flex flex-col items-center space-y-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <div className="text-sm text-base-content/60">
                  Your NFT is being minted on the blockchain
                </div>
              </div>

              <div className="max-w-sm mx-auto">
                <div className="card bg-gradient-to-br from-primary/20 to-secondary/20">
                  <div className="card-body items-center">
                    <div className="text-4xl mb-2">📚</div>
                    <h3 className="card-title text-lg">Wikipedia Supporter</h3>
                    <p className="text-center text-sm">125 Karma Points</p>
                    <div className="badge badge-primary badge-sm">Soulbound NFT</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="space-y-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="card-title text-2xl justify-center">Congratulations!</h2>
              <p className="text-base-content/70">
                Your Karma NFT has been successfully minted
              </p>

              <div className="max-w-sm mx-auto">
                <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30">
                  <div className="card-body items-center">
                    <div className="text-4xl mb-2">📚</div>
                    <h3 className="card-title text-lg">Wikipedia Supporter</h3>
                    <p className="text-center text-sm mb-2">125 Karma Points</p>
                    <div className="flex gap-2">
                      <div className="badge badge-primary badge-sm">Soulbound NFT</div>
                      <div className="badge badge-success badge-sm">Verified</div>
                    </div>
                    <div className="text-xs text-base-content/60 mt-2">
                      Token ID: #WKP-2024-001
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info max-w-md mx-auto">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <h4 className="font-bold">NFT Details</h4>
                  <p className="text-sm">
                    Your soulbound NFT represents your verified $25 donation to Wikipedia. 
                    It cannot be transferred and serves as permanent proof of your good deed.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="btn btn-outline btn-wide">
                  <ExternalLink className="w-4 h-4" />
                  View on Blockscout
                </button>
                
                <div className="divider">Share your impact</div>
                
                <button className="btn btn-primary btn-outline">
                  <ExternalLink className="w-4 h-4" />
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