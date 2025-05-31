'use client'

import { useEffect } from 'react'
import { useNotification } from '@blockscout/app-sdk'

export function TransactionNotificationManager() {
  const { openTxToast } = useNotification()

  useEffect(() => {
    const handleTransactionToast = (event: CustomEvent) => {
      const { chainId, txHash } = event.detail
      
      openTxToast(chainId, txHash)
    }

    window.addEventListener('showTransactionToast', handleTransactionToast as EventListener)

    return () => {
      window.removeEventListener('showTransactionToast', handleTransactionToast as EventListener)
    }
  }, [openTxToast])

  // This component doesn't render anything
  return null
} 