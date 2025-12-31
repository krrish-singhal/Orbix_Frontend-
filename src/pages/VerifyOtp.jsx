import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'

const VerifyOtp = () => {
  const inputsRef = useRef([])
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  const handleChange = (e, index) => {
    const value = e.target.value
    if (/^\d$/.test(value)) {
      e.target.value = value
      if (index < 5) inputsRef.current[index + 1]?.focus()
    } else {
      e.target.value = ''
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'Enter') {
      handleVerify()
    }
  }

  const handleVerify = () => {
    const otp = inputsRef.current.map((ref) => ref?.value).join('')
    if (otp.length < 6) {
      setError('Enter 6 digit OTP')
      return
    }
    setError('')
    setLoading(true)

    setTimeout(() => {
      gsap.to('.otp-container', {
        opacity: 0,
        y: 30,
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () => navigate('/captain-riding')
      })
    }, 1500)
  }

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center otp-container relative transition-all">

      {/* Uber Logo top-left */}
      <div className="absolute top-4 left-4">
        <img
          className="w-16"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt="Uber Logo"
        />
      </div>

      <h2 className="text-2xl font-bold mb-4 text-gray-800 mt-10">Enter OTP</h2>

      {/* OTP Boxes */}
      <div className="flex gap-3 mb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            type="text"
            maxLength="1"
            className="w-12 h-12 border-2 border-gray-300 rounded text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            ref={(el) => (inputsRef.current[i] = el)}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          />
        ))}
      </div>

      {/* Error */}
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={loading}
        className={`w-40 py-2 mt-2 rounded-md text-white font-semibold transition ${
          loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Verifying...' : 'Verify'}
      </button>
    </div>
  )
}

export default VerifyOtp
