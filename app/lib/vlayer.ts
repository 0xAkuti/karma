import { createVlayerClient, preverifyEmail } from '@vlayer/sdk'

// VLayer configuration - handle both server and client side
const getVLayerConfig = () => {
  // Check if we're on client side
  const isClient = typeof window !== 'undefined'
  
  return {
    proverUrl: isClient 
      ? (process.env.NEXT_PUBLIC_VLAYER_PROVER_URL || 'http://127.0.0.1:3000')
      : (process.env.VLAYER_PROVER_URL || 'http://127.0.0.1:3000'),
    dnsServiceUrl: isClient
      ? (process.env.NEXT_PUBLIC_VLAYER_DNS || 'http://127.0.0.1:3002')
      : (process.env.VLAYER_DNS || 'http://127.0.0.1:3002'),
    token: isClient
      ? (process.env.NEXT_PUBLIC_VLAYER_API_TOKEN || undefined)
      : (process.env.VLAYER_API_TOKEN || undefined), // undefined for local devnet
  }
}

export interface EmailProofResult {
  proof: any
  emailHash: string
  donationAmount: string
}

export interface EmailProofError {
  message: string
  code?: string
}

export class VLayerEmailProver {
  private vlayerClient: any
  private proverAddress: string
  private proverAbi: any
  private config: ReturnType<typeof getVLayerConfig>

  constructor(proverAddress: string, proverAbi: any) {
    this.proverAddress = proverAddress
    this.proverAbi = proverAbi
    this.config = getVLayerConfig()
    this.vlayerClient = createVlayerClient({
      url: this.config.proverUrl,
      token: this.config.token,
    })
  }

  async generateProof(
    mimeEmail: string,
    chainId: number
  ): Promise<EmailProofResult> {
    try {
      console.log('Starting email proof generation...')
      console.log('Prover URL:', this.config.proverUrl)
      console.log('DNS URL:', this.config.dnsServiceUrl)
      
      // Check if SKIP_VERIFY is enabled for demo mode
      const skipVerify = process.env.NEXT_PUBLIC_SKIP_VERIFY === 'true'
      
      // For SKIP_VERIFY mode, always use Base Sepolia for verification
      const verificationChainId = skipVerify ? 84532 : chainId
      
      console.log('Chain ID (original):', chainId)
      console.log('Chain ID (verification):', verificationChainId)
      console.log('SKIP_VERIFY mode:', skipVerify)
      console.log('Prover Address:', this.proverAddress)
      
      // Preverify the email
      const unverifiedEmail = await preverifyEmail({
        mimeEmail,
        dnsResolverUrl: `${this.config.dnsServiceUrl}/dns-query`,
        token: this.config.token,
      })

      console.log('Email preverified, generating proof...')

      // Generate the proof - use verification chain ID (Base Sepolia for demo mode)
      const hash = await this.vlayerClient.prove({
        address: this.proverAddress,
        proverAbi: this.proverAbi,
        functionName: 'main',
        chainId: verificationChainId,
        args: [unverifiedEmail],
      })

      console.log('Proof generation started, hash:', hash)

      // Wait for the proof result
      const result = await this.vlayerClient.waitForProvingResult({ hash })
      
      console.log('Proof generation completed:', result)

      // Handle both new (3 elements) and old (4 elements) contract formats
      let proof, emailHash, donationAmount
      
      if (result.length === 3) {
        // New format: [proof, emailHash, donationAmount] 
        proof = result[0]
        emailHash = result[1]
        donationAmount = result[2]
      } else if (result.length === 4) {
        // Old format fallback: [proof, emailHash, donationAmount, targetWallet] - but targetWallet is empty now
        proof = result[0]
        emailHash = result[1]
        donationAmount = result[2] // Donation amount is at index 2, not 3
      } else {
        throw new Error(`Unexpected result format: ${result.length} elements`)
      }

      // Convert hex donation amount to readable string if needed
      let readableDonationAmount = donationAmount
      if (typeof donationAmount === 'string' && donationAmount.startsWith('0x')) {
        try {
          // Try to convert hex to number and format as currency
          const hexValue = parseInt(donationAmount, 16)
          if (hexValue > 0) {
            // Convert from cents to dollars (assuming the hex represents cents)
            // Keep as plain number string for contract verification
            readableDonationAmount = (hexValue / 100).toFixed(2)
          } else {
            readableDonationAmount = '0.00'
          }
        } catch (error) {
          console.warn('Failed to convert hex donation amount:', donationAmount, error)
          readableDonationAmount = donationAmount // Keep original if conversion fails
        }
      }
      // Don't add currency symbol here - let the UI handle display formatting

      return {
        proof: proof,
        emailHash: emailHash,
        donationAmount: readableDonationAmount, // Keep as plain number string
      }
    } catch (error: any) {
      console.error('Error generating email proof:', error)
      throw new Error(`Failed to generate email proof: ${error.message}`)
    }
  }
}

export async function createEmailProver(
  proverAddress: string,
  proverAbi: any
): Promise<VLayerEmailProver> {
  return new VLayerEmailProver(proverAddress, proverAbi)
}

// Helper function to read EML file content
export function readEMLFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      resolve(content)
    }
    reader.onerror = (e) => {
      reject(new Error('Failed to read EML file'))
    }
    reader.readAsText(file)
  })
} 