import { createConfig } from '@privy-io/wagmi'
import { http } from 'viem'
import { defineChain } from 'viem'

// Define Flow Testnet chain
export const flowTestnet = defineChain({
  id: 545,
  name: 'Flow Testnet',
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
      name: 'Flow Diver',
      url: 'https://testnet.flowdiver.io',
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
  } else {
    // Create dynamic chain for other networks
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
      testnet: chainId !== 1, // Consider it testnet unless it's mainnet
    })
  }
}

const configuredChain = getConfiguredChain()

export const config = createConfig({
  chains: [configuredChain, flowTestnet, anvilLocal], // Include all supported chains for switching
  transports: {
    [flowTestnet.id]: http('https://testnet.evm.nodes.onflow.org'),
    [anvilLocal.id]: http('http://127.0.0.1:8545'),
    [configuredChain.id]: http(process.env.NEXT_PUBLIC_RPC_URL || configuredChain.rpcUrls.default.http[0]),
  },
})

export { configuredChain }

declare module '@privy-io/wagmi' {
  interface Register {
    config: typeof config
  }
} 