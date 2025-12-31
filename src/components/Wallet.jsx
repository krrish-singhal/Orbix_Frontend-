"use client"
import { useState, useEffect, useContext } from 'react'
import { UserDataContext } from '../context/UserContext'
import axios from 'axios'

const Wallet = ({ isOpen, onClose }) => {
  const { walletBalance, setWalletBalance, user, setUser } = useContext(UserDataContext)
  const [transactions, setTransactions] = useState([])
  const [showAddMoney, setShowAddMoney] = useState(false)
  const [addAmount, setAddAmount] = useState('')
  const [selectedAddMethod, setSelectedAddMethod] = useState('razorpay')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchWalletDetails()
    }
  }, [isOpen])

  const fetchWalletDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/payments/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWalletBalance(response.data.balance || 0)
      // Filter only wallet payment transactions (debit type)
      const walletTransactions = (response.data.transactions || []).filter(
        transaction => transaction.type === 'debit' && transaction.description?.includes('ride')
      )
      setTransactions(walletTransactions)
    } catch (error) {
      console.error('Error fetching wallet details:', error)
      setWalletBalance(0)
      setTransactions([])
    }
  }

  const handleAddMoney = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      let endpoint = '/wallet/add-money/razorpay';
      if (selectedAddMethod === 'phonepe') endpoint = '/wallet/add-money/phonepe';
      // You can add more endpoints for UPI, card, netbanking if implemented
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/payments${endpoint}`,
        {
          amount: parseFloat(addAmount),
          paymentDetails: {} // Add payment details if needed
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        setWalletBalance(response.data.wallet.balance)
        // Update user context wallet
        if (user) setUser({ ...user, wallet: { ...user.wallet, balance: response.data.wallet.balance } })
        setAddAmount('')
        setShowAddMoney(false)
        fetchWalletDetails() // Refresh the wallet data
        alert('Money added successfully!')
      }
    } catch (error) {
      console.error('Error adding money:', error)
      alert('Failed to add money. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
        return '+'
      case 'debit':
        return '-'
      default:
        return '•'
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case 'credit':
        return 'text-green-600'
      case 'debit':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-400/20 via-white to-green-100/40 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border-2 border-green-500 dark:border-green-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-green-100 dark:border-green-900">
          <h2 className="text-2xl font-extrabold text-green-600 dark:text-green-400 tracking-tight">Orbix Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            aria-label="Close wallet"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Balance Section */}
          <div className="p-6">
            <div className="bg-gradient-to-r from-green-500 to-green-400 dark:from-green-700 dark:to-green-600 rounded-2xl p-7 text-white shadow-lg flex flex-col items-center">
              <p className="text-green-100 text-base font-medium mb-2 tracking-wide">Current Balance</p>
              <p className="text-4xl font-extrabold tracking-tight">₹{walletBalance.toFixed(2)}</p>
            </div>
          </div>

          {/* Add Money Section */}
          <div className="px-6 pb-6">
            {!showAddMoney ? (
              <button
                onClick={() => setShowAddMoney(true)}
                className="w-full bg-gradient-to-r from-green-500 to-green-400 dark:from-green-700 dark:to-green-600 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:scale-105 transition-transform"
              >
                Add Money
              </button>
            ) : (
              <div className="border border-green-200 dark:border-green-700 rounded-xl p-5 bg-white dark:bg-gray-800 shadow-lg">
                <h3 className="font-bold text-green-600 dark:text-green-400 mb-3 text-lg">Add Money to Wallet</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-green-700 dark:text-green-300 mb-1">Amount</label>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      className="w-full border border-green-300 dark:border-green-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-green-700 dark:text-green-300 mb-1">Payment Method</label>
                    <select
                      value={selectedAddMethod}
                      onChange={(e) => setSelectedAddMethod(e.target.value)}
                      className="w-full border border-green-300 dark:border-green-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold"
                    >
                      <option value="razorpay">Razorpay</option>
                      <option value="upi">UPI</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="netbanking">Net Banking</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setShowAddMoney(false)}
                      className="flex-1 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 py-2 rounded-lg font-bold hover:bg-green-50 dark:hover:bg-green-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddMoney}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-400 dark:from-green-700 dark:to-green-600 text-white py-2 rounded-lg font-bold shadow-md hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Add Money'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="px-6 pb-6">
            <h3 className="font-bold text-green-600 dark:text-green-400 mb-3 text-lg">Wallet Transactions</h3>
            {transactions.length === 0 ? (
              <div className="py-8 text-center">
                <i className="ri-wallet-3-line text-4xl text-green-400 mb-2"></i>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No wallet payments yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {transactions.slice(0, 10).map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-green-100 dark:border-green-700 rounded-xl bg-gradient-to-r from-green-50 to-white dark:from-green-900 dark:to-gray-900 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <i className="ri-subtract-line text-green-600 dark:text-green-400 text-xl"></i>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-base">
                          {transaction.description || 'Ride Payment'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="font-extrabold text-lg text-green-600 dark:text-green-400">
                      -₹{transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Wallet
