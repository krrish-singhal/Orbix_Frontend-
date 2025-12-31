import React, { createContext, useState, useEffect } from 'react'

// Create the context
export const UserDataContext = createContext()

// Create the provider
const UserContext = ({ children }) => {
  const [user, setUser] = useState(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  // Restore user and wallet from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setWalletBalance(parsedUser?.wallet?.balance || 0)
    }
    setLoading(false) // ✅ Mark context as ready
  }, [])

  // Keep user in localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
      setWalletBalance(user?.wallet?.balance || 0)
    } else {
      localStorage.removeItem('user')
      setWalletBalance(0)
    }
  }, [user])

  // While loading context, don't render children yet
  if (loading) return null

  return (
    <UserDataContext.Provider value={{ user, setUser, walletBalance, setWalletBalance }}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserContext
