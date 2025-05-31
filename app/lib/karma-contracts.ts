import { createPublicClient, createWalletClient, custom, http, parseEther } from 'viem'
import { flowTestnet, anvilLocal, configuredChain } from './wagmi'
import { defineChain } from 'viem'

// Get the target chain based on environment
export const getTargetChain = () => {
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '545')
  
  if (chainId === 545) {
    return flowTestnet
  } else if (chainId === 31337) {
    return anvilLocal
  } else {
    return configuredChain
  }
}

// Dynamic chain configuration based on environment
const getDynamicChain = () => {
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '545')
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet.evm.nodes.onflow.org'
  
  // If it's Flow Testnet, use the pre-defined chain
  if (chainId === 545) {
    return flowTestnet
  }
  
  // If it's Anvil, use the pre-defined chain
  if (chainId === 31337) {
    return anvilLocal
  }
  
  // For other chains, create a dynamic chain definition
  return defineChain({
    id: chainId,
    name: chainId === 31337 ? 'Anvil Local' : `Chain ${chainId}`,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: [rpcUrl],
      },
    },
    blockExplorers: chainId === 31337 ? undefined : {
      default: {
        name: 'Blockscout',
        url: process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL?.replace('/api', '') || 'https://testnet.flowdiver.io',
      },
    },
    testnet: chainId !== 1, // Consider it testnet unless it's mainnet
  })
}

// Contract ABIs
export const KARMA_NFT_ABI = [
  {
    "type": "function",
    "name": "mint",
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "tokenId", "type": "uint256" },
      { "name": "_burnAuth", "type": "uint8" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "tokenURI",
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "Issued",
    "inputs": [
      { "name": "from", "type": "address", "indexed": true },
      { "name": "to", "type": "address", "indexed": true },
      { "name": "tokenId", "type": "uint256", "indexed": true },
      { "name": "burnAuth", "type": "uint8" }
    ]
  }
] as const

export const KARMA_PROOF_VERIFIER_ABI = [
  {
    "type": "function",
    "name": "verify",
    "inputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          {
            "name": "seal",
            "type": "tuple",
            "components": [
              { "name": "verifierSelector", "type": "bytes4" },
              { "name": "seal", "type": "bytes32[8]" },
              { "name": "mode", "type": "uint8" }
            ]
          },
          { "name": "callGuestId", "type": "bytes32" },
          { "name": "length", "type": "uint256" },
          {
            "name": "callAssumptions",
            "type": "tuple",
            "components": [
              { "name": "proverContractAddress", "type": "address" },
              { "name": "functionSelector", "type": "bytes4" },
              { "name": "settleChainId", "type": "uint256" },
              { "name": "settleBlockNumber", "type": "uint256" },
              { "name": "settleBlockHash", "type": "bytes32" }
            ]
          }
        ]
      },
      { "name": "_karmaHash", "type": "bytes32" },
      { "name": "_targetWallet", "type": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
] as const

// Contract addresses from environment
export const getContractAddresses = () => ({
  karmaNFT: process.env.NEXT_PUBLIC_KARMA_NFT_CONTRACT as `0x${string}` || '0x0000000000000000000000000000000000000000',
  karmaVerifier: process.env.NEXT_PUBLIC_VLAYER_VERIFIER_CONTRACT_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000',
  prover: process.env.NEXT_PUBLIC_VLAYER_PROVER_CONTRACT_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000'
})

// Create viem clients with dynamic chain
export const createClients = () => {
  const chain = getDynamicChain()
  
  const publicClient = createPublicClient({
    chain,
    transport: http()
  })

  // For wallet client, we'll create it with custom transport when needed
  const getWalletClient = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return createWalletClient({
        chain,
        transport: custom(window.ethereum)
      })
    }
    return null
  }

  return { publicClient, getWalletClient, chain }
}

export interface MintNFTParams {
  proof: any
  emailHash: string
  targetWallet: string
  donationAmount: string
}

export interface MintNFTResult {
  transactionHash: string
  tokenId: string
  blockscoutUrl: string
}

// Helper function to request chain switch
export async function requestChainSwitch(targetChainId: number) {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
      return true
    } catch (error: any) {
      // If chain doesn't exist, try to add it
      if (error.code === 4902) {
        const targetChain = getTargetChain()
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: targetChain.name,
              nativeCurrency: targetChain.nativeCurrency,
              rpcUrls: targetChain.rpcUrls.default.http,
              blockExplorerUrls: targetChain.blockExplorers ? [targetChain.blockExplorers.default.url] : undefined,
            }],
          })
          return true
        } catch (addError) {
          console.error('Failed to add chain:', addError)
          throw new Error(`Failed to add ${targetChain.name} to your wallet. Please add it manually.`)
        }
      }
      throw new Error(`Failed to switch to the correct network. Please switch to ${getTargetChain().name} manually.`)
    }
  }
  throw new Error('No wallet detected')
}

// Main function to mint Karma NFT with proof verification
export async function mintKarmaNFT(
  params: MintNFTParams,
  userAddress: string
): Promise<MintNFTResult> {
  const { proof, emailHash, targetWallet } = params
  const contracts = getContractAddresses()
  const { getWalletClient, chain } = createClients()
  
  const walletClient = getWalletClient()
  if (!walletClient) {
    throw new Error('Wallet not connected')
  }

  // Check current chain and switch if necessary
  const targetChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '545')
  
  try {
    // Get current chain from wallet
    const currentChainId = await window.ethereum?.request({ method: 'eth_chainId' })
    const currentChainIdNumber = parseInt(currentChainId, 16)
    
    if (currentChainIdNumber !== targetChainId) {
      console.log(`Switching from chain ${currentChainIdNumber} to ${targetChainId}`)
      await requestChainSwitch(targetChainId)
      
      // Wait a bit for the switch to complete
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  } catch (error: any) {
    console.error('Chain switch error:', error)
    throw new Error(`Network mismatch. Please switch your wallet to ${getTargetChain().name} (Chain ID: ${targetChainId}) and try again.`)
  }

  try {
    // Use the email hash as the token ID
    const tokenId = BigInt(emailHash)
    
    console.log('Minting Karma NFT with params:', {
      proof,
      tokenId: tokenId.toString(),
      targetWallet,
      verifierContract: contracts.karmaVerifier,
      chainId: chain.id,
      chainName: chain.name
    })

    // Call the verify function on the KarmaProofVerifier contract
    const hash = await walletClient.writeContract({
      address: contracts.karmaVerifier,
      abi: KARMA_PROOF_VERIFIER_ABI,
      functionName: 'verify',
      args: [proof, emailHash as `0x${string}`, targetWallet as `0x${string}`],
      account: userAddress as `0x${string}`
    })

    console.log('Transaction submitted:', hash)

    // Generate blockscout URL - for anvil, just use a placeholder
    const blockscoutUrl = chain.id === 31337 
      ? `http://localhost:8545/tx/${hash}` // Placeholder for local development
      : `${process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL?.replace('/api', '')}/tx/${hash}`

    return {
      transactionHash: hash,
      tokenId: tokenId.toString(),
      blockscoutUrl
    }
  } catch (error: any) {
    console.error('Error minting Karma NFT:', error)
    throw new Error(`Failed to mint Karma NFT: ${error.message}`)
  }
}

// Generate Blockscout URLs
export function generateBlockscoutUrls(tokenId: string, transactionHash?: string) {
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '545')
  const contracts = getContractAddresses()
  
  // For anvil/local development, use placeholder URLs
  if (chainId === 31337) {
    return {
      token: `http://localhost:8545/token/${contracts.karmaNFT}`,
      transaction: transactionHash ? `http://localhost:8545/tx/${transactionHash}` : null,
      contract: `http://localhost:8545/address/${contracts.karmaNFT}`
    }
  }
  
  // For other chains, use the configured blockscout URL
  const baseUrl = process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL?.replace('/api', '') || 'https://testnet.flowdiver.io'
  
  return {
    token: `${baseUrl}/token/${contracts.karmaNFT}?tab=token_transfers`,
    transaction: transactionHash ? `${baseUrl}/tx/${transactionHash}` : null,
    contract: `${baseUrl}/address/${contracts.karmaNFT}`
  }
}

// Generate Twitter share text
export function generateTwitterShareText(params: {
  donationAmount: string
  transactionHash?: string
  tokenId?: string
}) {
  const { donationAmount, transactionHash } = params
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '545')
  
  let text = `🎉 Just earned Karma points for donating ${donationAmount} to Wikipedia! `
  text += `Supporting free knowledge and earning soulbound NFTs with vlayer zero-knowledge proofs. `
  text += `#Karma #Web3ForGood #Wikipedia #vlayer #ZKProofs`
  
  if (transactionHash && chainId !== 31337) {
    const baseUrl = process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL?.replace('/api', '') || 'https://testnet.flowdiver.io'
    text += `\n\nView proof: ${baseUrl}/tx/${transactionHash}`
  }
  
  return encodeURIComponent(text)
}

// Generate Twitter share URL
export function generateTwitterShareUrl(params: {
  donationAmount: string
  transactionHash?: string
  tokenId?: string
}) {
  const text = generateTwitterShareText(params)
  return `https://twitter.com/intent/tweet?text=${text}`
} 