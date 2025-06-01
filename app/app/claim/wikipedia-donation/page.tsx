'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import with SSR disabled to prevent Blockscout hook issues during prerendering
const WikipediaClaim = dynamic(
  () => import('../../../components/WikipediaClaim').then(mod => ({ default: mod.WikipediaClaim })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }
)

export default function WikipediaDonationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={
            <div className="flex justify-center items-center py-20">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }>
            <WikipediaClaim />
          </Suspense>
        </div>
      </div>
    </div>
  )
} 