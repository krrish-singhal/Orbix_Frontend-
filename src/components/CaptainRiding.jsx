import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import FinishRide from '../components/FinishRide'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import "remixicon/fonts/remixicon.css"

const CaptainRiding = () => {
  const [finishRidePanel, setFinishRidePanel] = useState(false)
  const finishRidePanelRef = useRef(null)

  useGSAP(() => {
    if (finishRidePanel) {
      gsap.to(finishRidePanelRef.current, {
        y: 0,
        duration: 0.4,
        ease: 'power2.out'
      })
    } else {
      gsap.to(finishRidePanelRef.current, {
        y: '100%',
        duration: 0.4,
        ease: 'power2.in'
      })
    }
  }, [finishRidePanel])

  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-transparent">
        <img
          className="w-16"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt="Uber"
        />
        <Link
          to="/captain-home"
          className="h-10 w-10 bg-white flex items-center justify-center rounded-full shadow"
        >
          <i className="ri-logout-box-r-line text-lg font-medium"></i>
        </Link>
      </div>

      {/* Fullscreen Map */}
      <img
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
        alt="map"
      />

      {/* Bottom Yellow Panel */}
      <div
        className="fixed bottom-12 left-0 w-full bg-yellow-400 z-30 p-5 pt-4 rounded-t-3xl shadow-xl"
        onClick={() => setFinishRidePanel(true)}
      >
        {/* Arrow Handle */}
        <div className="flex justify-center mb-2">
          <i className="ri-arrow-up-wide-line text-2xl text-gray-700"></i>
        </div>

        {/* Distance & Button Row */}
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-xl font-semibold text-black">4 KM away</h4>
          <button className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg shadow">
            Complete Ride
          </button>
        </div>
      </div>

      {/* Slide-Up Finish Ride Panel */}
      <div
        ref={finishRidePanelRef}
        className="fixed top-0 left-0 right-0 bottom-0 z-50 translate-y-full bg-white px-4 py-6 shadow-2xl overflow-y-auto"
      >
        <FinishRide
          ride={{
            user: { fullname: { firstname: "John Doe" } },
            pickup: "562/11-A",
            destination: "MG Road",
            fare: 120,
          }}
          setFinishRidePanel={setFinishRidePanel}
        />
      </div>
    </div>
  );
}

export default CaptainRiding
