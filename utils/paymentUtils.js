// Payment utility functions for dynamic fare calculation and processing

export const calculatePlatformFee = (totalFare, feePercentage = 0.15) => {
  return Math.round(totalFare * feePercentage)
}

export const calculateCaptainEarnings = (totalFare, feePercentage = 0.15) => {
  return Math.round(totalFare * (1 - feePercentage))
}

export const calculateTotalFare = (baseFare, additionalFees = {}) => {
  const additionalTotal = Object.values(additionalFees).reduce((sum, fee) => sum + (Number.parseFloat(fee) || 0), 0)
  return baseFare + additionalTotal
}

export const formatCurrency = (amount, currency = "₹") => {
  return `${currency}${amount.toLocaleString("en-IN")}`
}

export const generatePaymentQR = (paymentData) => {
  return JSON.stringify({
    ...paymentData,
    timestamp: Date.now(),
    type: "ride_payment",
  })
}

export const processPaymentSuccess = (totalFare, captainEarnings, platformFee) => {
  const paymentDetails = {
    totalFare,
    captainEarnings,
    platformFee,
    timestamp: Date.now(),
    status: "completed",
  }

  // Dispatch custom event for payment success
  const event = new CustomEvent("payment-success", {
    detail: paymentDetails,
  })
  window.dispatchEvent(event)

  return paymentDetails
}

export const validatePaymentAmount = (amount) => {
  return amount > 0 && !isNaN(amount) && isFinite(amount)
}
