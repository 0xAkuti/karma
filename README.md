# 🫶 Karma Proof: Onchain proof for offchain good
Built at EthGlobal Prague Hackathon, May 2025

## The problem:
Too many real-world public good goes unrecognized and unrewarded, like donating blood, volunteering, planting trees, or cleaned up the beach. Governments and local organizations sometimes reward these efforts, but their programs are often limited to specific regions, depend on external funding, and require a lot of manual effort—making them hard to scale globally.

## Our solution:
We build Karma Proof app to bring real-world good deeds on chain. 
Using vlayer's email proof technology, users can upload their email showing their public good actions (e.g. donating to wikipedia) and turn them into onchain proof. In return, they earn Karma Points and soulbound NFTs. This allow users to build public reputation onchain, while earning real-world perks like discounts, free transport, or access to events.

We want makes good deeds Visible, Verifiable, Valued. Karma Proof is a step towards building a global public good system that’s transparent, scalable, and self-sustaining. 

#### Key Features
- Easy verification: Users upload .eml files to verify real-world actions.
- Karma points: non-transferable, soulbound ERC-20 tokens. Integrated with Blockscout Merit so that users can swap Karma points with Merits to access web3 perks/ airdrops.
- Soulbound NFTs: we designed six main NFT types to represent public good in different domains- Time, Care, Gift, Knowledge, Ecology, Access. 
- To encourage adoption, we designed gamified features like streaks, leaderboards, and campaigns (e.g., “Blood Donation Week”). User can also share Karma NFTs with friends on Twitter.
- Reward shop: users can spend Karma points to redeem web2 rewards globally.

#### Tech Stack  
🌐 Core Architecture
A privacy-first public good verification system combining:
Zero-knowledge email proofs (via vLayer)
Soulbound NFTs & tokens (on Flow)
Real-time transaction tracking & rewards (via Blockscout)

🔐 vLayer – ZK Email Verification
Users upload .eml files (processed client-side)
vLayer's prover network generates off-chain proofs
Proofs are verified on-chain by KarmaProofVerifier
NFTs + soulbound tokens minted based on verified data
Example: donation amount parsed from Wikipedia email using regex
No personal data on-chain—only proof hash and value

🪙 Flow – Soulbound NFT & Token System
Optimized for low-cost, high-scale social apps
ERC-5484 soulbound NFTs via KarmaNFT.sol
Burn authorization stored in extraData (bit-packed)

Dual token model:
KarmaNFT = reputation/collection
KarmaToken = redeemable, non-transferable rewards

Smart contracts include gas optimization + role-based controls

🧩 Blockscout – UX, Feedback, and Rewards
Real-time transaction status via custom React hook (useTransactionStatus)
Explorer popups via Blockscout SDK + TransactionPopupListener

Merits bridge:
Full SIWE flow
Users redeem karma tokens for Merits in a custom shop
Handles nonce, message signing, and session tracking
