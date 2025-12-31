"use client"

import React, { useState, useRef, useEffect } from "react"
import QrScanner from "qr-scanner"
import axios from "axios"
import toast from "react-hot-toast"

const QRScanner = ({ isOpen, onClose, onPaymentSuccess }) => {
  const videoRef = useRef(null)
  const [qrScanner, setQrScanner] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (isOpen && videoRef.current) {
      startScanning()
    }

    return () => {
      if (qrScanner) {
        qrScanner.stop()
        qrScanner.destroy()
      }
    }
  }, [isOpen])

  const startScanning = async () => {
    try {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          handleScanResult(result.data)
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment"
        }
      )

      await scanner.start()
      setQrScanner(scanner)
      setIsScanning(true)
      toast.success("QR Scanner started")
    } catch (error) {
      toast.error("Failed to start camera. Please check permissions.")
    }
  }

  const handleScanResult = async (data) => {
    if (isProcessing) return

    setScannedData(data)
    setIsProcessing(true)

    try {
      // Parse QR code data - expect payment format
      let paymentData
      try {
        paymentData = JSON.parse(data)
      } catch {
        // If not JSON, treat as simple fare amount
        const fareMatch = data.match(/\d+/)
        if (fareMatch) {
          paymentData = { amount: parseInt(fareMatch[0]) }
        } else {
          throw new Error("Invalid QR code format")
        }
      }

      const { amount = 0, rideId = null, description = "Ride Payment" } = paymentData

      if (amount <= 0) {
        throw new Error("Invalid payment amount")
      }

      // Process payment
      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/payments/process-ride-payment`,
        {
          amount,
          rideId,
          description,
          paymentMethod: "wallet"
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        toast.success(`₹${amount} received successfully!`)
        onPaymentSuccess && onPaymentSuccess({
          amount,
          rideId,
          transactionId: response.data.transactionId
        })
        
        // Close scanner after successful payment
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        throw new Error(response.data.message || "Payment failed")
      }
    } catch (error) {
      toast.error(error.message || "Invalid QR code or payment failed")
      setIsProcessing(false)
    }
  }

  const stopScanning = () => {
    if (qrScanner) {
      qrScanner.stop()
      qrScanner.destroy()
      setQrScanner(null)
    }
    setIsScanning(false)
  }

  const handleClose = () => {
    stopScanning()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Scan QR Code</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <i className="ri-close-line text-xl text-gray-600"></i>
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative mb-6">
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
            />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br"></div>
              </div>
            </div>

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-xl p-4 flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm font-medium text-gray-700">Processing payment...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mb-6">
          <p className="text-gray-600 text-sm mb-2">
            Position the QR code within the frame to scan
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <i className="ri-qr-code-line mr-1"></i>
              <span>QR Payment</span>
            </div>
            <div className="flex items-center">
              <i className="ri-secure-payment-line mr-1"></i>
              <span>Secure</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="text-center">
          {isScanning ? (
            <div className="flex items-center justify-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm font-medium">Scanner Active</span>
            </div>
          ) : (
            <div className="flex items-center justify-center text-gray-500">
              <i className="ri-camera-off-line mr-2"></i>
              <span className="text-sm">Scanner Inactive</span>
            </div>
          )}
        </div>

        {/* Scanned Data Display (for debugging) */}
        {scannedData && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Scanned Data:</p>
            <p className="text-sm font-mono text-gray-800 break-all">{scannedData}</p>
          </div>
        )}

        {/* Manual Amount Entry (fallback) */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">
            Having trouble? Enter amount manually
          </p>
          <ManualPaymentForm onPaymentSuccess={onPaymentSuccess} onClose={onClose} />
        </div>
      </div>
    </div>
  )
}

// Manual payment form component
const ManualPaymentForm = ({ onPaymentSuccess, onClose }) => {
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const fareAmount = parseFloat(amount)
    if (!fareAmount || fareAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setIsProcessing(true)

    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/payments/process-ride-payment`,
        {
          amount: fareAmount,
          description: "Manual Ride Payment",
          paymentMethod: "wallet"
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        toast.success(`₹${fareAmount} received successfully!`)
        onPaymentSuccess && onPaymentSuccess({
          amount: fareAmount,
          transactionId: response.data.transactionId
        })
        onClose()
      } else {
        throw new Error(response.data.message || "Payment failed")
      }
    } catch (error) {
      toast.error(error.message || "Payment failed")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full p-3 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          min="1"
          step="1"
        />
      </div>
      <button
        type="submit"
        disabled={isProcessing || !amount}
        className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? "Processing..." : "Receive Payment"}
      </button>
    </form>
  )
}

export default QRScanner