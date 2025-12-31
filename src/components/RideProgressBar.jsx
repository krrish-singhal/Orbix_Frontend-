"use client"

import { useEffect, useState } from "react"

const RideProgressBar = ({ progress = 0, steps = [], currentStep = 0 }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 100)
    return () => clearTimeout(timer)
  }, [progress])

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000 ease-out animate-glow"
          style={{ width: `${animatedProgress}%` }}
        ></div>
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center space-y-2 transition-all duration-300 ${
                index <= currentStep ? "animate-scaleIn" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  index < currentStep
                    ? "bg-green-500 text-white animate-heartbeat"
                    : index === currentStep
                      ? "bg-blue-500 text-white animate-pulse"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {index < currentStep ? <i className="ri-check-line"></i> : index + 1}
              </div>
              <span
                className={`text-xs text-center transition-colors duration-300 ${
                  index <= currentStep ? "text-gray-900 font-medium" : "text-gray-500"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RideProgressBar
