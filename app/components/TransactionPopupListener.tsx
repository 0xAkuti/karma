'use client'

import { useEffect } from 'react'
import { useTransactionPopup } from '@blockscout/app-sdk'

export function TransactionPopupListener() {
  const { openPopup } = useTransactionPopup()

  useEffect(() => {
    const handleOpenTransactionPopup = (event: CustomEvent) => {
      const { chainId, address, blockscoutUrl } = event.detail
      
      console.log('Opening transaction popup for:', { chainId, address })
      
      try {
        // Try with the custom configuration
        const config: any = {
          chainId,
          address,
        }
        
        // Add custom Blockscout URL if provided
        if (blockscoutUrl) {
          config.customBlockscoutUrl = blockscoutUrl
          console.log('Using custom Blockscout URL:', blockscoutUrl)
        }
        
        openPopup(config)
        console.log('Transaction popup opened successfully')
      } catch (error) {
        console.error('Error opening transaction popup:', error)
        if (error instanceof Error) {
          console.error('Error details:', error.message)
        }
      }
    }

    window.addEventListener('openTransactionPopup', handleOpenTransactionPopup as EventListener)

    return () => {
      window.removeEventListener('openTransactionPopup', handleOpenTransactionPopup as EventListener)
    }
  }, [openPopup])

  // This component doesn't render anything
  return null
} 