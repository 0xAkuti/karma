'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { readEMLFile, createEmailProver, EmailProofResult } from '@/lib/vlayer'
import React from 'react'

interface EmailProofUploadProps {
  onProofGenerated: (result: EmailProofResult) => void
  onError: (error: string) => void
  disabled?: boolean
}

export function EmailProofUpload({ onProofGenerated, onError, disabled }: EmailProofUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock contract addresses - these should come from env or contract deployment
  const PROVER_ADDRESS = process.env.NEXT_PUBLIC_VLAYER_PROVER_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890'
  const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '545')
  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet.evm.nodes.onflow.org'

  // Correct ABI for EmailDomainProver - updated to match new 3-value signature
  const PROVER_ABI = [
    {
      "type": "function",
      "name": "main",
      "inputs": [
        {
          "name": "unverifiedEmail",
          "type": "tuple",
          "internalType": "struct UnverifiedEmail",
          "components": [
            {
              "name": "email",
              "type": "string",
              "internalType": "string"
            },
            {
              "name": "dnsRecord",
              "type": "tuple",
              "internalType": "struct DnsRecord",
              "components": [
                {
                  "name": "name",
                  "type": "string",
                  "internalType": "string"
                },
                {
                  "name": "recordType",
                  "type": "uint8",
                  "internalType": "uint8"
                },
                {
                  "name": "data",
                  "type": "string",
                  "internalType": "string"
                },
                {
                  "name": "ttl",
                  "type": "uint64",
                  "internalType": "uint64"
                }
              ]
            },
            {
              "name": "verificationData",
              "type": "tuple",
              "internalType": "struct VerificationData",
              "components": [
                {
                  "name": "validUntil",
                  "type": "uint64",
                  "internalType": "uint64"
                },
                {
                  "name": "signature",
                  "type": "bytes",
                  "internalType": "bytes"
                },
                {
                  "name": "pubKey",
                  "type": "bytes",
                  "internalType": "bytes"
                }
              ]
            }
          ]
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct Proof",
          "components": [
            {
              "name": "seal",
              "type": "tuple",
              "internalType": "struct Seal",
              "components": [
                {
                  "name": "verifierSelector",
                  "type": "bytes4",
                  "internalType": "bytes4"
                },
                {
                  "name": "seal",
                  "type": "bytes32[8]",
                  "internalType": "bytes32[8]"
                },
                {
                  "name": "mode",
                  "type": "uint8",
                  "internalType": "enum ProofMode"
                }
              ]
            },
            {
              "name": "callGuestId",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "length",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "callAssumptions",
              "type": "tuple",
              "internalType": "struct CallAssumptions",
              "components": [
                {
                  "name": "proverContractAddress",
                  "type": "address",
                  "internalType": "address"
                },
                {
                  "name": "functionSelector",
                  "type": "bytes4",
                  "internalType": "bytes4"
                },
                {
                  "name": "settleChainId",
                  "type": "uint256",
                  "internalType": "uint256"
                },
                {
                  "name": "settleBlockNumber",
                  "type": "uint256",
                  "internalType": "uint256"
                },
                {
                  "name": "settleBlockHash",
                  "type": "bytes32",
                  "internalType": "bytes32"
                }
              ]
            }
          ]
        },
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "",
          "type": "string",
          "internalType": "string"
        }
      ],
      "stateMutability": "view"
    }
  ]

  // Debug: Log the configuration on mount
  React.useEffect(() => {
    console.log('=== Email Proof Upload Configuration ===')
    console.log('Chain ID:', CHAIN_ID)
    console.log('RPC URL:', RPC_URL)
    console.log('Prover Address:', PROVER_ADDRESS)
    console.log('Environment Variables:')
    console.log('- NEXT_PUBLIC_CHAIN_ID:', process.env.NEXT_PUBLIC_CHAIN_ID)
    console.log('- NEXT_PUBLIC_RPC_URL:', process.env.NEXT_PUBLIC_RPC_URL)
    console.log('- NEXT_PUBLIC_VLAYER_PROVER_CONTRACT_ADDRESS:', process.env.NEXT_PUBLIC_VLAYER_PROVER_CONTRACT_ADDRESS)
    console.log('=========================================')
  }, [])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type !== 'message/rfc822' && !file.name.endsWith('.eml')) {
      onError('Please upload a valid EML file (.eml extension)')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      onError('File size must be less than 10MB')
      return
    }

    setUploadedFile(file)
  }

  const generateProof = async () => {
    if (!uploadedFile) {
      onError('Please upload an EML file first')
      return
    }

    setIsProcessing(true)

    try {
      // Read the EML file content
      const emailContent = await readEMLFile(uploadedFile)
      
      // Create the email prover
      const prover = await createEmailProver(PROVER_ADDRESS, PROVER_ABI)
      
      // Generate the proof
      const result = await prover.generateProof(emailContent, CHAIN_ID)
      
      onProofGenerated(result)
    } catch (error: any) {
      console.error('Proof generation error:', error)
      onError(error.message || 'Failed to generate proof')
    } finally {
      setIsProcessing(false)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : uploadedFile
            ? 'border-success bg-success/5'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={disabled ? undefined : openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".eml,message/rfc822"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-4">
          {uploadedFile ? (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-success" />
              <div>
                <p className="text-lg font-medium text-success">File Ready</p>
                <p className="text-sm text-gray-500 mt-1">{uploadedFile.name}</p>
                <p className="text-xs text-gray-400">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop your EML file here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse files
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* File Info */}
      {uploadedFile && (
        <div className="bg-base-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                Email file ready for verification
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generate Proof Button */}
      <button
        onClick={generateProof}
        disabled={!uploadedFile || isProcessing || disabled}
        className="btn btn-primary w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Generating Proof...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Generate Email Proof
          </>
        )}
      </button>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How to get your EML file:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>For Gmail: Open the email → More (⋮) → Show original → Download original</li>
              <li>For Outlook: Open the email → File → Save As → Choose "Outlook Message Format"</li>
              <li>For Apple Mail: Select email → File → Save As → Choose "Raw Message Source"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 