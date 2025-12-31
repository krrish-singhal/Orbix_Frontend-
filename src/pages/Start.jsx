import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/image.png";

const Start = () => {
  const [light, setLight] = useState("red");
  const [showLetters, setShowLetters] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Auto-toggle traffic light
  useEffect(() => {
    if (!autoMode || animationComplete) return;

    const lightSequence = ["red", "yellow", "green"];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % lightSequence.length;
      setLight(lightSequence[currentIndex]);
      
      // Trigger letters animation on green light
      if (lightSequence[currentIndex] === "green" && !showLetters) {
        setTimeout(() => {
          setShowLetters(true);
          setTimeout(() => {
            setShowWelcome(true);
            setAnimationComplete(true);
          }, 5000);
        }, 600);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [autoMode, showLetters, animationComplete]);

  const toggleLight = () => {
    setAutoMode(false); // Disable auto mode on manual interaction
    if (light === "red") {
      setLight("green");
      setTimeout(() => {
        setShowLetters(true);
        setTimeout(() => setShowWelcome(true), 5000);
      }, 600);
    } else {
      setLight("red");
      setShowLetters(false);
      setShowWelcome(false);
    }
  };

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex flex-col items-center justify-center overflow-hidden px-4">
      
      {/* Orbix Logo */}
	  <div className="absolute top-4 sm:top-6 left-4 sm:left-6 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl bg-white shadow-lg flex items-center justify-center overflow-hidden z-30">
		<img
		  src={logo}
		  alt="Orbix Logo"
		  className="w-3/4 h-3/4 object-contain"
		/>
	  </div>

      {/* ...Auto Mode Indicator removed as per instructions... */}

      {/* Traffic Light */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        onClick={toggleLight}
        className="cursor-pointer p-6 sm:p-7 md:p-8 rounded-3xl bg-gradient-to-b from-gray-800 via-gray-900 to-black shadow-2xl flex flex-col items-center transform hover:scale-105 transition-all duration-300 border-4 border-gray-700 -mt-28 sm:-mt-32 md:-mt-36"
      >
        <motion.div
          animate={light === "red" ? { 
            boxShadow: "0 0 20px #ef4444, 0 0 40px #ef4444, 0 0 60px #ef4444" 
          } : {}}
          className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full mb-5 sm:mb-6 transition-all duration-500 border-4 ${
            light === "red" ? "bg-red-500 shadow-2xl border-red-300" : "bg-gray-700 border-gray-600"
          }`}
        />
        <motion.div
          animate={light === "yellow" ? { 
            boxShadow: "0 0 20px #eab308, 0 0 40px #eab308, 0 0 60px #eab308" 
          } : {}}
          className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full mb-5 sm:mb-6 transition-all duration-500 border-4 ${
            light === "yellow" ? "bg-yellow-400 shadow-2xl border-yellow-200" : "bg-gray-700 border-gray-600"
          }`}
        />
        <motion.div
          animate={light === "green" ? { 
            boxShadow: "0 0 20px #22c55e, 0 0 40px #22c55e, 0 0 60px #22c55e" 
          } : {}}
          className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full transition-all duration-500 border-4 ${
            light === "green" ? "bg-green-500 shadow-2xl border-green-300" : "bg-gray-700 border-gray-600"
          }`}
        />
      </motion.div>

      {/* ORBIX Letters with enhanced animation - horizontal row below the traffic lights */}
      {!showWelcome &&
        showLetters && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-32 sm:translate-y-36 md:translate-y-40 flex flex-row gap-4 sm:gap-8 md:gap-12 lg:gap-16 items-center z-10">
            {["O", "R", "B", "I", "X"].map((letter, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -100, scale: 0.5, rotate: -180 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  rotate: 0
                }}
                transition={{ 
                  delay: i * 0.25 + 1,
                  duration: 0.8,
                  type: "spring",
                  bounce: 0.5
                }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-2xl"
                style={{
                  textShadow: "0 4px 20px rgba(251, 191, 36, 0.5)"
                }}
              >
                {letter}
              </motion.div>
            ))}
          </div>
        )}

      {/* Welcome + Button with enhanced styling */}
      {showWelcome && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-24 sm:translate-y-28 md:translate-y-32 text-center px-4 z-30 w-full max-w-sm sm:max-w-md md:max-w-2xl">
          <h1 className="text-gray-900 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 sm:mb-8 leading-tight">
            Welcome to Orbix 🚖
          </h1>
          <div className="w-full flex justify-center">
            <Link
              to="/login"
              className="inline-block bg-gray-900 hover:bg-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 text-white px-8 py-3 sm:px-12 sm:py-4 md:px-16 md:py-5 rounded-xl font-semibold shadow-2xl hover:shadow-3xl text-base sm:text-lg md:text-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Start Riding
            </Link>
          </div>
        </div>
      )}

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.05, 0.12, 0.05],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              delay: i * 0.4,
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full blur-xl"
            style={{
              width: `${80 + Math.random() * 120}px`,
              height: `${80 + Math.random() * 120}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `translate(-50%, -50%)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Start;
