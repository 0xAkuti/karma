import { createConfig } from '@privy-io/wagmi'
import { http } from 'viem'
import { defineChain } from 'viem'

// Define Flow Testnet chain
export const flowTestnet = defineChain({
  id: 545,
  name: 'Flow EVM Testnet',
  nativeCurrency: {
    name: 'Flow',
    symbol: 'FLOW',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Flow Testnet Explorer',
      url: 'https://evm-testnet.flowscan.io',
    },
  },
  testnet: true,
})

// Define Base Sepolia chain
export const baseSepolia = defineChain({
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://sepolia.basescan.org',
    },
  },
  testnet: true,
})

// Define Anvil local chain
export const anvilLocal = defineChain({
  id: 31337,
  name: 'Anvil Local',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  testnet: true,
})

// Dynamic chain configuration based on environment
const getConfiguredChain = () => {
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '545')
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet.evm.nodes.onflow.org'
  
  if (chainId === 545) {
    return flowTestnet
  } else if (chainId === 31337) {
    return anvilLocal
  } else if (chainId === 84532) {
    return baseSepolia
  } else {
    // Create dynamic chain for other networks
    const blockscoutUrl = process.env.NEXT_PUBLIC_BLOCKSCOUT_URL
    
    return defineChain({
      id: chainId,
      name: `Chain ${chainId}`,
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
      blockExplorers: blockscoutUrl ? {
        default: {
          name: 'Blockscout',
          url: blockscoutUrl,
        },
      } : undefined,
      testnet: chainId !== 1, // Consider it testnet unless it's mainnet
    })
  }
}

const configuredChain = getConfiguredChain()

export const config = createConfig({
  chains: [configuredChain, flowTestnet, anvilLocal, baseSepolia], // Include all supported chains for switching
  transports: {
    [flowTestnet.id]: http('https://testnet.evm.nodes.onflow.org'),
    [anvilLocal.id]: http('http://127.0.0.1:8545'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [configuredChain.id]: http(process.env.NEXT_PUBLIC_RPC_URL || configuredChain.rpcUrls.default.http[0]),
  },
})

export { configuredChain }

declare module '@privy-io/wagmi' {
  interface Register {
    config: typeof config
  }
} 