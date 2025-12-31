"use client"

import { useState } from "react"
import { io } from "socket.io-client"

import "./App.css"
import { Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeContext"
import Start from "./pages/Start"
import UserSignup from "./pages/UserSignup"
import UserLogin from "./pages/UserLogin"
import CaptainLogin from "./pages/CaptainLogin"
import CaptainSignup from "./pages/CaptainSignup"
import Home from "./pages/Home"
import UserProtectWrapper from "./pages/UserProtectWrapper"
import UserLogout from "./pages/UserLogout"
import CaptainHome from "./pages/CaptainHome"
import CaptainProtectWrapper from "./pages/CaptainProtectWrapper"
import CaptainLogout from "./pages/CaptainLogout"
import Riding from "./pages/Riding"
import CaptainRiding from "./components/CaptainRiding"
import VerifyOtp from "./pages/VerifyOtp"
import LookingForDriver from "./pages/LookingForDriver"
import RideTracking from "./pages/RideTracking"
import RideHistory from "./pages/RideHistory"
import ProfileSettings from "./pages/ProfileSettings"
import OrbixWallet from "./pages/OrbixWallet"
import HelpSupport from "./pages/HelpSupport"
import CompleteRide from "./pages/CompleteRide"
import UserRideView from "./pages/UserRideView"
import CaptainRideTracking from "./pages/CaptainRideTracking"
import CaptainWallet from "./pages/CaptainWallet"
import CaptainVehicle from "./pages/CaptainVehicle"
import CaptainProfile from "./pages/CaptainProfile"
import CaptainRides from "./pages/CaptainRides"
import CaptainSettings from "./pages/CaptainSettings"
import CaptainHelp from "./pages/CaptainHelp"
import CaptainConfirmRide from "./pages/CaptainConfirmRide"

function App() {
  const [ride, setRide] = useState(null)
  const [ridePopupPanel, setRidePopupPanel] = useState(false)
  const [otp, setOtp] = useState("------")
  const captain = JSON.parse(localStorage.getItem("captain"))

  const newSocket = io("http://localhost:4000") // Adjust the URL as needed

  newSocket.on("ride-request", (data) => {
    // Accept ride for any valid vehicle type
    if (["car", "moto", "auto"].includes(data.vehicleType) && captain?.vehicle?.vehicleType === data.vehicleType) {
      // Ensure distance and duration are always present and correct
      data.distance = typeof data.distance === "number" ? data.distance : 0
      data.duration = typeof data.duration === "number" ? data.duration : 0
      setRide(data)
      setRidePopupPanel(true)
    }
  })

  newSocket.on("ride-start-success", (data) => {
    alert(data.message)
    setShowOtpModal(false)
    setConfirmRidePopupPanel(false)
    setRide(null)
    setCurrentRide(null)
    // Always set OTP from backend if available
    setOtpInput(data.otp || "------")
    // Navigate to captain ride tracking page with ride data
    navigate("/captain-ride-tracking", {
      state: {
        rideData: currentRide,
        captainDetails: captain,
        otp: data.otp || "------",
      },
    })
  })

  return (
    <ThemeProvider>
      <div className="transition-colors duration-200 min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text">
        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="/signup" element={<UserSignup />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/riding" element={<Riding />} />

          <Route path="/captain-riding" element={<CaptainRiding />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

          {/* Captain Routes */}
          <Route path="/captain-login" element={<CaptainLogin />} />
          <Route path="/captain-signup" element={<CaptainSignup />} />
          <Route
            path="/home"
            element={
              <UserProtectWrapper>
                <Home />
              </UserProtectWrapper>
            }
          />
          <Route
            path="/looking-for-driver"
            element={
              <UserProtectWrapper>
                <LookingForDriver />
              </UserProtectWrapper>
            }
          />
          <Route
            path="/ride-tracking"
            element={
              <UserProtectWrapper>
                <RideTracking />
              </UserProtectWrapper>
            }
          />
          <Route
            path="/logout"
            element={
              <UserProtectWrapper>
                <UserLogout />
              </UserProtectWrapper>
            }
          />
          <Route
            path="/captain-home"
            element={
              <CaptainProtectWrapper>
                <CaptainHome />
              </CaptainProtectWrapper>
            }
          />
          <Route
            path="/captain-ride-tracking"
            element={
              <CaptainProtectWrapper>
                <CaptainRideTracking />
              </CaptainProtectWrapper>
            }
          />
          <Route
            path="/captain-confirm-ride"
            element={
              <CaptainProtectWrapper>
                <CaptainConfirmRide />
              </CaptainProtectWrapper>
            }
          />
          <Route
            path="/captain-logout"
            element={
              <CaptainProtectWrapper>
                <CaptainLogout />
              </CaptainProtectWrapper>
            }
          />
          <Route
            path="/captain-vehicle"
            element={
              <CaptainProtectWrapper>
                <CaptainVehicle />
              </CaptainProtectWrapper>
            }
          />
          <Route
            path="/captain-rides"
            element={
              <CaptainProtectWrapper>
                <CaptainRides />
              </CaptainProtectWrapper>
            }
          />
          <Route
            path="/captain-wallet"
            element={
              <CaptainProtectWrapper>
                <CaptainWallet />
              </CaptainProtectWrapper>
            }
          />
          <Route
            path="/captain-profile"
            element={
              <CaptainProtectWrapper>
                <CaptainProfile />
              </CaptainProtectWrapper>
            }
          />
          <Route
            path="/captain-settings"
            element={
              <CaptainProtectWrapper>
                <CaptainSettings />
              </CaptainProtectWrapper>
            }
          />
          <Route
            path="/captain-help"
            element={
              <CaptainProtectWrapper>
                <CaptainHelp />
              </CaptainProtectWrapper>
            }
          />
          <Route
            path="/ride-history"
            element={
              <UserProtectWrapper>
                <RideHistory />
              </UserProtectWrapper>
            }
          />
          <Route
            path="/profile-settings"
            element={
              <UserProtectWrapper>
                <ProfileSettings />
              </UserProtectWrapper>
            }
          />
          <Route
            path="/profile"
            element={
              <UserProtectWrapper>
                <ProfileSettings />
              </UserProtectWrapper>
            }
          />
          <Route
            path="/orbix-wallet"
            element={
              <UserProtectWrapper>
                <OrbixWallet />
              </UserProtectWrapper>
            }
          />
          <Route
            path="/help-support"
            element={
              <UserProtectWrapper>
                <HelpSupport />
              </UserProtectWrapper>
            }
          />
          <Route
            path="/user-ride-view"
            element={
              <UserProtectWrapper>
                <UserRideView />
              </UserProtectWrapper>
            }
          />
          <Route
            path="/complete-ride"
            element={
              <CaptainProtectWrapper>
                <CompleteRide />
              </CaptainProtectWrapper>
            }
          />
          <Route
            path="/captain-wallet"
            element={
              <CaptainProtectWrapper>
                <CaptainWallet />
              </CaptainProtectWrapper>
            }
          />
          <Route
            path="/captain-vehicle"
            element={
              <CaptainProtectWrapper>
                <CaptainVehicle />
              </CaptainProtectWrapper>
            }
          />
          <Route
            path="/captain-profile"
            element={
              <CaptainProtectWrapper>
                <CaptainProfile />
              </CaptainProtectWrapper>
            }
          />
          <Route
            path="/captain-rides"
            element={
              <CaptainProtectWrapper>
                <CaptainRides />
              </CaptainProtectWrapper>
            }
          />
          <Route
            path="/captain-settings"
            element={
              <CaptainProtectWrapper>
                <CaptainSettings />
              </CaptainProtectWrapper>
            }
          />
          <Route
            path="/captain-help"
            element={
              <CaptainProtectWrapper>
                <CaptainHelp />
              </CaptainProtectWrapper>
            }
          />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App
