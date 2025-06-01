# Test: Wallet Signing Fix for Blockscout Merits

## Issue
The Shop page's Blockscout Merits sign-up only worked with Privy embedded wallets, not external wallets like MetaMask connected via Privy.

## Solution
Updated the Shop component to detect wallet type and use the appropriate signing method:
- **Embedded wallets**: Use Privy's `useSignMessage` hook
- **External wallets**: Use wagmi's `useSignMessage` hook

## Test Cases

### 1. Embedded Wallet (Privy)
1. Visit the shop page
2. Connect using Privy embedded wallet
3. Try to sign up for Blockscout Merits
4. Verify that signing works using Privy's method
5. Check console for "Using Privy embedded wallet signing"

### 2. External Wallet (MetaMask via Privy)
1. Visit the shop page  
2. Connect MetaMask through Privy
3. Try to sign up for Blockscout Merits
4. Verify that signing works using wagmi method
5. Check console for "Using external wallet signing via Wagmi"

### 3. Wallet Type Detection
- Embedded wallet shows: "Using embedded wallet (embedded)"
- External wallet shows: "Using external wallet (metamask)" or similar

## Key Changes Made

1. **Imports**: Added `useSignMessage as useWagmiSignMessage` from 'wagmi'
2. **Wallet Detection**: Added `isEmbeddedWallet` and `isExternalWallet` detection
3. **Universal Signing**: Created `signMessage` function that routes to appropriate method
4. **UI Improvements**: Shows wallet type in the sign-up interface

## Expected Behavior
Both embedded and external wallets should now work for Blockscout Merits sign-up, with appropriate signing method used based on wallet type. 