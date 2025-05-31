import { createPublicClient, createWalletClient, custom, http, parseEther } from 'viem'
import { flowTestnet, anvilLocal, configuredChain, baseSepolia } from './wagmi'
import { defineChain } from 'viem'

// Get the target chain based on environment
export const getTargetChain = () => {
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '545')
  
  if (chainId === 545) {
    return flowTestnet
  } else if (chainId === 31337) {
    return anvilLocal
  } else if (chainId === 84532) {
    return baseSepolia
  } else {
    return configuredChain
  }
}

// Dynamic chain configuration based on environment
const getDynamicChain = () => {
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '545')
  
  if (chainId === 545) {
    return flowTestnet
  } else if (chainId === 31337) {
    return anvilLocal
  } else if (chainId === 84532) {
    return baseSepolia
  } else {
    return configuredChain
  }
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
      { "name": "_targetWallet", "type": "address" },
      { "name": "_donationAmount", "type": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
] as const

// Get contract addresses from environment variables
export function getContractAddresses() {
  const karmaNFT = process.env.NEXT_PUBLIC_KARMA_NFT_CONTRACT
  const karmaProofVerifier = process.env.NEXT_PUBLIC_VLAYER_VERIFIER_CONTRACT_ADDRESS
  const prover = process.env.NEXT_PUBLIC_VLAYER_PROVER_CONTRACT_ADDRESS
  
  if (!karmaNFT || !karmaProofVerifier || !prover) {
    throw new Error('Missing required contract addresses in environment variables')
  }
  
  return {
    karmaNFT: karmaNFT as `0x${string}`,
    karmaProofVerifier: karmaProofVerifier as `0x${string}`,
    prover: prover as `0x${string}`,
  }
}

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
      console.log(`Attempting to switch to chain ID: ${targetChainId}`)
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
      console.log(`Successfully switched to chain ID: ${targetChainId}`)
      return true
    } catch (error: any) {
      console.log(`Switch failed for chain ID ${targetChainId}, error code: ${error.code}`, error)
      
      // If chain doesn't exist, try to add it
      if (error.code === 4902) {
        const targetChain = getTargetChain()
        console.log(`Attempting to add chain: ${targetChain.name}`, targetChain)
        
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
          console.log(`Successfully added chain: ${targetChain.name}`)
          return true
        } catch (addError: any) {
          console.error('Failed to add chain:', addError)
          throw new Error(`Failed to add ${targetChain.name} to your wallet. Please add it manually.`)
        }
      }
      
      // For other errors (like user rejection)
      if (error.code === 4001) {
        throw new Error(`User rejected the network switch to ${getTargetChain().name}.`)
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
  const { proof, emailHash, targetWallet, donationAmount } = params
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
      throw new Error(`Please switch to chain ID ${targetChainId}. Currently on chain ID ${currentChainIdNumber}`)
    }

    // Get the connected account from the wallet client
    const [connectedAccount] = await walletClient.getAddresses()
    
    if (!connectedAccount) {
      throw new Error('No account connected to wallet')
    }

    console.log('Minting NFT with params:', {
      verifier: contracts.karmaProofVerifier,
      proof: proof,
      emailHash: emailHash,
      targetWallet: targetWallet,
      donationAmount: donationAmount,
      account: connectedAccount
    })

    // Call the verifier contract
    const hash = await walletClient.writeContract({
      address: contracts.karmaProofVerifier as `0x${string}`,
      abi: KARMA_PROOF_VERIFIER_ABI,
      functionName: 'verify',
      args: [proof, emailHash as `0x${string}`, targetWallet as `0x${string}`, donationAmount],
      account: connectedAccount
    })

    console.log('Transaction submitted:', hash)

    // Generate blockscout URL using the same logic as generateBlockscoutUrls
    let blockscoutUrl: string
    if (chain.id === 31337) {
      blockscoutUrl = `http://localhost:8545/tx/${hash}` // Placeholder for local development
    } else if (process.env.NEXT_PUBLIC_BLOCKSCOUT_URL) {
      // Use configured blockscout URL if available
      blockscoutUrl = `${process.env.NEXT_PUBLIC_BLOCKSCOUT_URL}/tx/${hash}`
    } else if (chain.id === 545) {
      blockscoutUrl = `https://evm-testnet.flowscan.io/tx/${hash}` // Flow Testnet explorer fallback
    } else if (chain.id === 84532) {
      blockscoutUrl = `https://sepolia.basescan.org/tx/${hash}` // Base Sepolia explorer fallback
    } else {
      blockscoutUrl = `https://blockscout.example.com/tx/${hash}`
    }

    return {
      transactionHash: hash,
      tokenId: emailHash,
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
  
  // Use configured blockscout URL if available (takes priority)
  if (process.env.NEXT_PUBLIC_BLOCKSCOUT_URL) {
    const baseUrl = process.env.NEXT_PUBLIC_BLOCKSCOUT_URL
    return {
      token: `${baseUrl}/token/${contracts.karmaNFT}`,
      transaction: transactionHash ? `${baseUrl}/tx/${transactionHash}` : null,
      contract: `${baseUrl}/address/${contracts.karmaNFT}`
    }
  }
  
  // For Flow Testnet, use FlowScan as fallback
  if (chainId === 545) {
    const baseUrl = 'https://evm-testnet.flowscan.io'
    return {
      token: `${baseUrl}/token/${contracts.karmaNFT}`,
      transaction: transactionHash ? `${baseUrl}/tx/${transactionHash}` : null,
      contract: `${baseUrl}/address/${contracts.karmaNFT}`
    }
  }
  
  // For Base Sepolia, use BaseScan as fallback
  if (chainId === 84532) {
    const baseUrl = 'https://sepolia.basescan.org'
    return {
      token: `${baseUrl}/token/${contracts.karmaNFT}`,
      transaction: transactionHash ? `${baseUrl}/tx/${transactionHash}` : null,
      contract: `${baseUrl}/address/${contracts.karmaNFT}`
    }
  }
  
  // Default fallback
  const baseUrl = 'https://blockscout.example.com'
  return {
    token: `${baseUrl}/token/${contracts.karmaNFT}`,
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
    let baseUrl: string
    
    // Use configured blockscout URL if available (takes priority)
    if (process.env.NEXT_PUBLIC_BLOCKSCOUT_URL) {
      baseUrl = process.env.NEXT_PUBLIC_BLOCKSCOUT_URL
    } else if (chainId === 545) {
      baseUrl = 'https://evm-testnet.flowscan.io'
    } else if (chainId === 84532) {
      baseUrl = 'https://sepolia.basescan.org'
    } else {
      baseUrl = 'https://blockscout.example.com'
    }
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