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
  targetWallet: string
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
      console.log('Chain ID:', chainId)
      console.log('Prover Address:', this.proverAddress)
      
      // Preverify the email
      const unverifiedEmail = await preverifyEmail({
        mimeEmail,
        dnsResolverUrl: `${this.config.dnsServiceUrl}/dns-query`,
        token: this.config.token,
      })

      console.log('Email preverified, generating proof...')

      // Generate the proof
      const hash = await this.vlayerClient.prove({
        address: this.proverAddress,
        proverAbi: this.proverAbi,
        functionName: 'main',
        chainId,
        args: [unverifiedEmail],
      })

      console.log('Proof generation started, hash:', hash)

      // Wait for the proof result
      const result = await this.vlayerClient.waitForProvingResult({ hash })
      
      console.log('Proof generation completed:', result)

      return {
        proof: result[0],
        emailHash: result[1],
        targetWallet: result[2],
        donationAmount: result[3],
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