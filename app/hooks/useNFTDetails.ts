import { useState, useEffect } from 'react'

export interface NFTDetails {
  tokenId: string
  contractAddress: string
  name?: string
  description?: string
  image?: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
  metadata?: any
}

export function useNFTDetails(contractAddress: string | null, tokenId: string | null) {
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const blockscoutUrl = process.env.NEXT_PUBLIC_BLOCKSCOUT_URL || 'https://base-sepolia.blockscout.com'

  const fetchNFTDetails = async (address: string, id: string): Promise<NFTDetails | null> => {
    try {
      console.log('Fetching NFT details for:', { address, id })
      console.log('Blockscout URL:', blockscoutUrl)
      
      // First, get basic token info
      const tokenUrl = `${blockscoutUrl}/api/v2/tokens/${address}`
      console.log('Fetching token info from:', tokenUrl)
      
      const tokenResponse = await fetch(tokenUrl, {
        headers: {
          'Accept': 'application/json',
        },
      })

      console.log('Token response status:', tokenResponse.status)
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('Token API Error Response:', errorText)
        throw new Error(`Token API Error: ${tokenResponse.status} - ${errorText}`)
      }

      const tokenData = await tokenResponse.json()
      console.log('Token data from Blockscout:', tokenData)

      // Then, get specific NFT instance details
      const instanceUrl = `${blockscoutUrl}/api/v2/tokens/${address}/instances/${id}`
      console.log('Fetching NFT instance from:', instanceUrl)
      
      const instanceResponse = await fetch(instanceUrl, {
        headers: {
          'Accept': 'application/json',
        },
      })

      console.log('Instance response status:', instanceResponse.status)
      let instanceData = null
      if (instanceResponse.ok) {
        instanceData = await instanceResponse.json()
        console.log('NFT instance data from Blockscout:', instanceData)
      } else {
        const errorText = await instanceResponse.text()
        console.warn('Could not fetch NFT instance data:', instanceResponse.status, errorText)
        console.warn('Using token data only')
      }

      // Combine the data
      const nftDetails: NFTDetails = {
        tokenId: id,
        contractAddress: address,
        name: instanceData?.metadata?.name || tokenData.name || `${tokenData.symbol || 'Karma'} NFT`,
        description: instanceData?.metadata?.description || tokenData.name || 'Soulbound Karma NFT for verified good deeds',
        image: instanceData?.metadata?.image || instanceData?.image_url,
        attributes: instanceData?.metadata?.attributes || [],
        metadata: instanceData?.metadata,
      }

      console.log('Final NFT details:', nftDetails)
      return nftDetails
    } catch (error) {
      console.error('Error fetching NFT details:', error)
      throw error
    }
  }

  useEffect(() => {
    if (contractAddress && tokenId) {
      setIsLoading(true)
      setError(null)
      
      fetchNFTDetails(contractAddress, tokenId)
        .then(details => {
          setNftDetails(details)
          setIsLoading(false)
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Failed to fetch NFT details')
          setIsLoading(false)
        })
    } else {
      setNftDetails(null)
      setError(null)
      setIsLoading(false)
    }
  }, [contractAddress, tokenId])

  return {
    nftDetails,
    isLoading,
    error,
    refetch: () => {
      if (contractAddress && tokenId) {
        setIsLoading(true)
        setError(null)
        fetchNFTDetails(contractAddress, tokenId)
          .then(setNftDetails)
          .catch(err => setError(err instanceof Error ? err.message : 'Failed to fetch NFT details'))
          .finally(() => setIsLoading(false))
      }
    }
  }
} 