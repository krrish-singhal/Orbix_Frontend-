"use client";
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { CaptainDataContext } from "../context/CaptainContext";
import QRScanner from "../components/QRScanner";
import axios from "axios";
import toast from "react-hot-toast";

const CaptainWallet = () => {
  const navigate = useNavigate();
  const { captain } = useContext(CaptainDataContext);
  const [transactions, setTransactions] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/payments/captain/wallet`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTransactions(response.data.transactions || []);
      setTotalEarnings(response.data.totalEarnings || 0);
      setPendingPayments(response.data.pendingPayments || []);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      toast.error("Failed to load wallet data");
    }
  };

  const handleScanPayment = () => {
    setShowScanner(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    const { amount, transactionId } = paymentData;
    setTotalEarnings((prev) => prev + amount);
    fetchWalletData(); // Refresh transactions
    toast.success(`₹${amount} received successfully!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate("/captain-home")}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            My Wallet
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Earnings</h3>
              <i className="ri-money-dollar-circle-line text-xl opacity-90"></i>
            </div>
            <p className="text-2xl font-bold">₹{totalEarnings}</p>
            <p className="text-xs mt-1 opacity-80">(Cash + UPI)</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Orbix Wallet Earnings</h3>
              <i className="ri-wallet-3-line text-xl opacity-90"></i>
            </div>
            <p className="text-2xl font-bold">₹{pendingPayments.reduce((sum, p) => sum + p.amount, 0)}</p>
            <p className="text-xs mt-1 opacity-80">(Auto-deducted)</p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Transaction History
          </h3>

          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="ri-add-line text-green-600"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Ride Payment
                      </h4>
                      <p className="text-sm text-gray-600">
                        {transaction.date && !isNaN(new Date(transaction.date).getTime())
                          ? new Date(transaction.date).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">
                    +₹{transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-history-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-white rounded-3xl p-6 mx-4 max-w-sm w-full text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <div className="w-24 h-24 border-4 border-white rounded-xl flex items-center justify-center">
                <i className="ri-qr-code-line text-white text-3xl animate-pulse"></i>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Scanning QR Code...
            </h3>
            <p className="text-gray-600 mb-4">
              Processing payment of ₹{pendingAmount}
            </p>

            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default CaptainWallet;
