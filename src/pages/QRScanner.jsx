"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import QRScanner from "../utils/qrScanner"

const QRScannerPage = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const scannerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    scannerRef.current = new QRScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stopScanning()
      }
    }
  }, [])

  const startScanning = async () => {
    setError(null)
    setScanResult(null)
    setIsScanning(true)

    try {
      await scannerRef.current.startScanning(videoRef.current, handleScanSuccess, handleScanError)
    } catch (err) {
      handleScanError(err)
    }
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stopScanning()
    }
    setIsScanning(false)
  }

  const handleScanSuccess = (qrData) => {
    const result = scannerRef.current.processPaymentQR(qrData)

    if (result.success) {
      setScanResult(result.data)
      setIsScanning(false)

      // Show success message
      setTimeout(() => {
        navigate("/home", {
          state: {
            paymentSuccess: true,
            amount: result.data.totalFare,
            message: `Payment of ₹${result.data.totalFare} successful! ₹${Math.round(result.data.totalFare * 0.15)} deducted as platform fee.`,
          },
        })
      }, 2000)
    } else {
      setError(result.error)
      setIsScanning(false)
    }
  }

  const handleScanError = (err) => {
    setError("Camera access denied or not available")
    setIsScanning(false)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black text-white p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">Scan QR Code</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="relative flex-1 flex items-center justify-center">
        {!isScanning && !scanResult && !error && (
          <div className="text-center text-white p-8">
            <div className="w-24 h-24 border-4 border-white rounded-lg mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Scan Payment QR</h2>
            <p className="text-gray-300 mb-6">Position the QR code within the frame to scan</p>
            <button
              onClick={startScanning}
              className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Start Scanning
            </button>
          </div>
        )}

        {isScanning && (
          <div className="relative w-full h-full">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />

            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-64 h-64 border-4 border-white rounded-lg relative">
                  {/* Corner indicators */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400"></div>

                  {/* Scanning line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-400 animate-pulse"></div>
                </div>

                <p className="text-white text-center mt-4">Scanning for QR code...</p>
              </div>
            </div>

            <button
              onClick={stopScanning}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Stop Scanning
            </button>
          </div>
        )}

        {scanResult && (
          <div className="text-center text-white p-8">
            <div className="w-24 h-24 bg-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
            <p className="text-gray-300 mb-2">₹{scanResult.totalFare} has been processed</p>
            <p className="text-sm text-gray-400">Platform fee: ₹{Math.round(scanResult.totalFare * 0.15)}</p>
            <div className="animate-pulse text-sm text-gray-300 mt-4">Redirecting...</div>
          </div>
        )}

        {error && (
          <div className="text-center text-white p-8">
            <div className="w-24 h-24 bg-red-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Scan Failed</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={startScanning}
              className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRScannerPage
