"use client"

const LoadingSpinner = ({ size = "md", color = "primary", text = "" }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  const colors = {
    primary: "border-black border-t-transparent",
    white: "border-white border-t-transparent",
    blue: "border-blue-500 border-t-transparent",
    green: "border-green-500 border-t-transparent",
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`animate-spin rounded-full border-2 ${sizes[size]} ${colors[color]}`}></div>
      {text && <p className="text-sm text-gray-600 animate-pulse">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
