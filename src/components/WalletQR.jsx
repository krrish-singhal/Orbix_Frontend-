import { useState, useEffect } from 'react'
import { QrCode, X, CheckCircle, CreditCard, Smartphone, Wallet, Copy } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const WalletQR = ({ isOpen, onClose, rideData, captain, onPaymentSuccess }) => {
  const [qrData, setQrData] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('wallet')
  const [processing, setProcessing] = useState(false)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    if (isOpen && rideData) {
      generateQRData()
    }
  }, [isOpen, rideData])

  const generateQRData = () => {
    // Generate QR code data for payment
    const qrPayload = {
      captainId: captain._id,
      rideId: rideData._id,
      amount: rideData.fare,
      timestamp: Date.now()
    }
    setQrData(JSON.stringify(qrPayload))
  }

  const processPayment = async () => {
    if (processing) return

    setProcessing(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/payments/process-ride-payment`,
        {
          amount: rideData.fare,
          rideId: rideData._id,
          description: `Ride from ${rideData.pickup} to ${rideData.destination}`,
          paymentMethod
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        setPaymentCompleted(true)
        toast.success('Payment processed successfully! 🎉')
        
        // Call success callback after a short delay
        setTimeout(() => {
          onPaymentSuccess && onPaymentSuccess(response.data)
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <QrCode className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
              <p className="text-sm text-gray-600">Complete ride payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!paymentCompleted ? (
            <>
              {/* Ride Details */}
              <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">From:</span>
                  <span className="text-gray-900 font-medium">{rideData.pickup}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">To:</span>
                  <span className="text-gray-900 font-medium">{rideData.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fare Amount:</span>
                  <span className="text-xl font-bold text-blue-600">₹{rideData.fare}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'wallet'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Wallet className={`w-5 h-5 ${paymentMethod === 'wallet' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className={`text-xs font-medium ${paymentMethod === 'wallet' ? 'text-blue-600' : 'text-gray-500'}`}>
                      Wallet
                    </span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className={`w-5 h-5 ${paymentMethod === 'upi' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className={`text-xs font-medium ${paymentMethod === 'upi' ? 'text-blue-600' : 'text-gray-500'}`}>
                      UPI
                    </span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className={`text-xs font-medium ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-500'}`}>
                      Card
                    </span>
                  </button>
                </div>
              </div>

              {/* QR Code Section */}
              {paymentMethod === 'upi' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Scan QR Code</label>
                    <button
                      onClick={() => setShowQR(!showQR)}
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      {showQR ? 'Hide' : 'Show'} QR
                    </button>
                  </div>
                  
                  {showQR && (
                    <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center space-y-4">
                      {/* QR Code Placeholder */}
                      <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-gray-400" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">Scan with any UPI app</p>
                        <div className="flex items-center gap-2 bg-white rounded-lg p-2 text-xs text-gray-500 max-w-full">
                          <span className="truncate flex-1">{qrData.substring(0, 30)}...</span>
                          <button
                            onClick={() => copyToClipboard(qrData)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Process Payment Button */}
              <button
                onClick={processPayment}
                disabled={processing}
                className={`w-full py-4 rounded-xl font-semibold transition-all ${
                  processing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {processing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  `Process Payment - ₹${rideData.fare}`
                )}
              </button>
            </>
          ) : (
            /* Payment Success */
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600">Trip completed successfully</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold text-green-600">₹{rideData.fare}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium text-gray-900 capitalize">{paymentMethod}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WalletQR