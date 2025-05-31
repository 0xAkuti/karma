'use client'

import { WalletConnect } from './WalletConnect'
import { Heart, Award, Shield, Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Hero Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="karma-gradient">Earn Karma</span>
              <br />
              <span className="text-neutral">for Good Deeds</span>
            </h1>
            <p className="text-xl text-neutral/70 mb-8 max-w-2xl mx-auto">
              Get rewarded with soulbound NFTs for verified charitable actions like donations, 
              volunteering, and making the world a better place.
            </p>
            <WalletConnect />
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="card-title text-neutral">Verified Good Deeds</h3>
                <p className="text-neutral/70">
                  Prove your charitable actions with cryptographic verification from trusted sources.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="card-title text-neutral">Soulbound NFTs</h3>
                <p className="text-neutral/70">
                  Earn permanent, non-transferable badges that showcase your positive impact.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <h3 className="card-title text-neutral">Privacy First</h3>
                <p className="text-neutral/70">
                  Zero-knowledge proofs protect your privacy while verifying your good deeds.
                </p>
              </div>
            </div>
          </div>

          {/* Supported Actions */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-neutral mb-8">Supported Good Deeds</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                'Wikipedia Donations',
                'Red Cross Blood Donations',
                'Devcon Volunteering',
                'Open Source Contributions',
                'Environmental Actions',
                'Community Service'
              ].map((action) => (
                <div key={action} className="badge badge-primary badge-lg">
                  {action}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 