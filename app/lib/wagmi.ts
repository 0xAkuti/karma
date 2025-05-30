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

export const config = createConfig({
  chains: [flowTestnet],
  transports: {
    [flowTestnet.id]: http(),
  },
}) 