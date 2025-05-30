import { Suspense } from 'react'
import { ClaimProjects } from '../../components/ClaimProjects'

export default function ClaimPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Claim Karma NFTs
            </h1>
            <p className="text-lg text-base-content/80 max-w-2xl mx-auto">
              Choose from verified projects to claim your soulbound Karma NFTs. Complete good deeds and get rewarded with on-chain proof of your positive impact.
            </p>
          </div>

          {/* Projects Grid */}
          <Suspense fallback={
            <div className="flex justify-center items-center py-20">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }>
            <ClaimProjects />
          </Suspense>
        </div>
      </div>
    </div>
  )
} 