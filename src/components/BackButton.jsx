import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function BackButton({ className = '' }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(-1)}
      className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ${className}`}
      aria-label="Go back"
    >
      <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  )
}
