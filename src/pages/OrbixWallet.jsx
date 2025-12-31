"use client"

import { useState, useEffect, useContext } from "react"
import { UserDataContext } from "../context/UserContext"
import { useNavigate } from "react-router-dom"
import { QRCodeCanvas } from "qrcode.react"
import BackButton from "../components/BackButton"
import axios from "axios"

const OrbixWallet = () => {
  const { walletBalance, setWalletBalance, user, setUser } = useContext(UserDataContext)
  const [transactions, setTransactions] = useState([])
  const [showQR, setShowQR] = useState(false)
  const [loading, setLoading] = useState(true)
  const [addMoneyAmount, setAddMoneyAmount] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem("token")
      const [walletResponse, userResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/payments/user/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      setWalletBalance(walletResponse.data.balance)
      if (user) setUser({ ...user, wallet: { ...user.wallet, balance: walletResponse.data.balance } })
      setTransactions(walletResponse.data.transactions || [])
      setUser(userResponse.data.user)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching wallet data:", error)
      setLoading(false)
    }
  }

  const handleAddMoney = async () => {
    if (!addMoneyAmount || addMoneyAmount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const addMoneyRes = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/payments/wallet/add-money/razorpay`,
        { amount: parseFloat(addMoneyAmount), paymentDetails: {} },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (addMoneyRes.data.success) {
        setWalletBalance(addMoneyRes.data.wallet.balance)
        if (user) setUser({ ...user, wallet: { ...user.wallet, balance: addMoneyRes.data.wallet.balance } })
        setAddMoneyAmount("")
        fetchWalletData() // Refresh data
        alert("Money added successfully!")
      }
    } catch (error) {
      console.error("Error adding money:", error)
      alert("Failed to add money. Please try again.")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case "credit":
        return "+"
      case "debit":
        return "-"
      default:
        return "•"
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case "credit":
        return "text-green-600"
      case "debit":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading wallet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BackButton />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orbix Wallet</h1>
            </div>
          </div>
          
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <p className="text-blue-100 text-sm mb-2">Current Balance</p>
            <p className="text-3xl font-bold">₹{walletBalance.toFixed(2)}</p>
            {user && (
              <p className="text-blue-100 text-sm mt-2">
                {user.fullname?.firstname 
                  ? `${user.fullname.firstname} ${user.fullname.lastname || ''}`.trim()
                  : user.fullname || 'User'}
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          
          <div className="space-y-4">
            {/* Add Money */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Add Money</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={addMoneyAmount}
                  onChange={(e) => setAddMoneyAmount(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddMoney}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Share Wallet QR</h3>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  {showQR ? "Hide" : "Show"} QR
                </button>
              </div>
              
              {showQR && (
                <div className="mt-4 flex justify-center">
                  <QRCodeCanvas
                    value={`orbix-wallet-${user?._id}`}
                    size={150}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          
          {transactions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description || "Transaction"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {getTransactionIcon(transaction.type)}₹{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate("/ride-history")}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Ride History
          </button>
          <button
            onClick={() => navigate("/home")}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrbixWallet
