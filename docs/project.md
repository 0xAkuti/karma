🌟 Soulbound Karma App – Architecture Overview
    Reward users with on-chain Karma NFTs (ERC-5484 soulbound) for verified good deeds (e.g., donating to Wikipedia). The web app uses email or web verification, a wallet login, and a playful user experience built with DaisyUI.

🧰 Tech Stack
    Layer	Tool
    Frontend	Next.js (App Router)
    UI Components	TailwindCSS + DaisyUI
    Wallet/Auth	Privy
    Backend/Storage	On-chain
    Proof System	vlayer.xyz (https://book.vlayer.xyz/introduction.html)
    NFT Minting	Soulbound ERC-721 (ERC-5484)
    Block explorer: Blockscout
    Data API Blockscout API (https://docs.blockscout.com/devs/apis)
    Blockchain: Flow Testnet (https://developers.flow.com/)

✨ Flow: User Journey

    Connect Wallet

        Uses Privy for seamless wallet login (EVM-compatible).


    Dashboard View

        Users see earned Karma NFTs (soulbound) styled with card, badge, category. Karma value varies by project/category (e.g., time, donation amount) based on defined formulas.

    Claim New Karma

        See list of supported projects:

            e.g. Wikipedia donation, Devcon voluneer, Red Cross blood donation, ...

    Select a project will show steps to verify,
        Email Claim Flow
            Step 1: Instructions to get .eml file (styled card with friendly icons)
            Step 2: File upload
            Step 3: Proof generation (animated spinner with playful text)
                     - Backend uses vlayer SDK to process .eml and get ZK proof.
            Step 4: Show Proof was generated or status message
            Step 5: Show NFT is beeing minted and status using Blockscout SDK (https://docs.blockscout.com/devs/blockscout-sdk)
            Step 4: NFT minted if valid; confetti/celebration screen and how much karma earned, add share on TWitter button with prefilled message
    
    Redeem Karam:
        - Karma can be redeemed for various things, for starters offer redeeming for Blockscout Merits (https://docs.blockscout.com/devs/integrate-merits)

🔌 Service Connections
🟢 Privy

    Wallet connect + auth

🟢 vlayer.xyz

    Generates proofs: for emails by validating .eml content (returns proof hash)

    If valid, you trigger a contract mint

🟢 Smart Contract (Soulbound)

    Mint NFT tied to wallet address (non-transferable) - minted by backend.
    Includes platform-initiated burn mechanism (as ERC-5484 does not define a standard burn).
    Uses proof hash/data and project ID for token metadata conditions/verification.

Deployment:
    - first develop locally
    - then depoy on vercel