// QR Scanner utility for handling payment QR codes
export class QRScanner {
  constructor() {
    this.isScanning = false
    this.stream = null
  }

  async startScanning(videoElement, onScanSuccess, onError) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      videoElement.srcObject = this.stream
      this.isScanning = true

      // Simulate QR code detection for demo
      this.simulateQRDetection(onScanSuccess)
    } catch (error) {
      console.error("Error accessing camera:", error)
      onError(error)
    }
  }

  stopScanning() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
    this.isScanning = false
  }

  simulateQRDetection(onScanSuccess) {
    // Simulate QR code detection after 3 seconds for demo
    setTimeout(() => {
      if (this.isScanning) {
        const mockQRData = {
          rideId: "demo_ride_" + Date.now(),
          totalFare: 250,
          captainEarnings: 212.5,
          timestamp: Date.now(),
          type: "ride_payment",
        }

        onScanSuccess(JSON.stringify(mockQRData))
      }
    }, 3000)
  }

  processPaymentQR(qrData) {
    try {
      const paymentData = JSON.parse(qrData)

      if (paymentData.type === "ride_payment") {
        // Dispatch custom event for payment processing
        const event = new CustomEvent("qr-payment-scanned", {
          detail: paymentData,
        })
        window.dispatchEvent(event)

        return {
          success: true,
          data: paymentData,
        }
      }

      return {
        success: false,
        error: "Invalid QR code format",
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to parse QR code",
      }
    }
  }
}

export default QRScanner
