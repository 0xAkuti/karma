# 🌟 Karma - Soulbound NFTs for Good Deeds

A Next.js application that rewards users with soulbound NFTs for verified charitable actions and good deeds.

## 🚀 Features

- **Wallet Authentication**: Seamless wallet connection with Privy
- **Soulbound NFTs**: Non-transferable badges for verified good deeds
- **Zero-Knowledge Proofs**: Email verification using vlayer.xyz
- **Modern UI**: Beautiful interface built with TailwindCSS + DaisyUI
- **Flow Blockchain**: Built on Flow Testnet with Blockscout integration

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, DaisyUI
- **Authentication**: Privy (wallet + email login)
- **Blockchain**: Flow Testnet, viem, wagmi
- **Proof System**: vlayer.xyz for email verification
- **UI Components**: Lucide React icons, custom animations

## 📋 Quick Start

### 1. Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env.local
```

### 2. Environment Setup

Edit `.env.local` with your configuration:

```bash
# Get your Privy App ID from https://console.privy.io
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id-here

# Flow Testnet Configuration (default values)
NEXT_PUBLIC_CHAIN_ID=545
NEXT_PUBLIC_RPC_URL=https://testnet.evm.nodes.onflow.org
NEXT_PUBLIC_BLOCKSCOUT_API_URL=https://testnet.flowdiver.io/api
```

### 3. Development

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## 🏗️ Project Structure

```
app/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx           # Main dashboard page
│   ├── globals.css        # Global styles + Tailwind
│   └── providers.tsx      # Privy + Wagmi providers
├── components/
│   ├── Dashboard.tsx      # Authenticated user dashboard
│   ├── Hero.tsx          # Landing page for unauthenticated users
│   ├── WalletConnect.tsx # Wallet connection component
│   └── KarmaCard.tsx     # Individual NFT display card
├── lib/
│   └── wagmi.ts          # Blockchain configuration
└── package.json          # Dependencies and scripts
```

## 🎯 User Journey

### 1. **Connect Wallet**
- Users connect via Privy (MetaMask, WalletConnect, etc.)
- Support for embedded wallets for new users

### 2. **Dashboard View**
- Display earned Karma NFTs with categories and points
- Show total karma score and impact statistics
- List supported projects for claiming new karma

### 3. **Claim New Karma** (Coming Soon)
- Select from supported projects (Wikipedia, Red Cross, etc.)
- Upload email proof (.eml file)
- vlayer generates zero-knowledge proof
- Smart contract mints soulbound NFT
- Celebration screen with sharing options

### 4. **Redeem Karma** (Coming Soon)
- Exchange karma points for rewards
- Integration with Blockscout Merits
- Community recognition features

## 🎨 Design System

### Theme Colors
- **Primary**: `#10b981` (Emerald)
- **Secondary**: `#06b6d4` (Cyan)
- **Accent**: `#8b5cf6` (Violet)
- **Neutral**: `#1f2937` (Gray)

### Components
- Built with DaisyUI for consistent styling
- Custom animations and transitions
- Responsive design for mobile/desktop
- Gradient text effects for karma branding

## 🔗 Integration Points

### Privy Authentication
- Configured for Flow Testnet
- Supports wallet + email login methods
- Embedded wallets for onboarding

### vlayer Email Proofs
- Zero-knowledge email verification
- Privacy-preserving proof generation
- Integration with smart contracts

### Flow Blockchain
- ERC-5484 soulbound NFT standard
- Blockscout API for transaction tracking
- Gas-efficient minting process

## 🚦 Development Status

### ✅ Completed (Phase 1)
- [x] Next.js application setup
- [x] Privy wallet authentication
- [x] Dashboard with mock data
- [x] Beautiful UI with DaisyUI
- [x] Responsive design
- [x] Project structure

### 🔄 In Progress (Phase 2)
- [ ] vlayer email proof integration
- [ ] Smart contract deployment
- [ ] Real NFT minting flow
- [ ] Blockscout API integration

### 📅 Planned (Phase 3)
- [ ] Email claim workflow
- [ ] Multiple project types
- [ ] Karma redemption system
- [ ] Social sharing features
- [ ] Analytics dashboard

## 🧪 Testing

```bash
# Run linting
npm run lint

# Check TypeScript
npx tsc --noEmit

# Format code
npx prettier --write .
```

## 📚 Documentation

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Privy Documentation](https://docs.privy.io/)
- [vlayer Documentation](https://book.vlayer.xyz/)
- [Flow Developer Docs](https://developers.flow.com/)
- [DaisyUI Components](https://daisyui.com/components/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the EthGlobal Prague hackathon submission. 