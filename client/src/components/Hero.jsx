import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { ArrowUpRight, Apple, Play } from "lucide-react";

export default function Hero() {
  const [loopKey, setLoopKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setLoopKey(prev => prev + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleCustomerClick = () => {
    navigate('/login/customer');
  };

  const handleVendorClick = () => {
    navigate('/login/vendor');
  };

  return (
    <section className="relative w-full h-screen flex items-center justify-center bg-[#FDF9DC] overflow-hidden pt-20">
      {/* Container with proper viewport height */}
      <div className="w-full max-w-7xl mx-auto px-4 h-full flex items-center">
        
        {/* Main content grid - fits exactly in viewport */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">

          {/* Text Content - Left side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full bg-white rounded-3xl lg:rounded-[48px] p-6 md:p-8 lg:p-12 shadow-lg order-2 lg:order-1"
          >
            {/* Main heading */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-4 lg:mb-6 font-helvetica">
              गली गली के<br />
              ठेले वाले <br />
              आपको यहाँ मिलेंगे.
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 mb-6 lg:mb-8 font-archivo font-medium">
              <TypewriterText key={`p-2-${loopKey}`} text="Desi Products, World-Class Quality, Street Prices" delay={1.5} />
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 lg:mb-8">
              <button 
                onClick={handleCustomerClick}
                className="w-full bg-[#1A6950] hover:bg-[#145a44] active:scale-95 text-white px-5 py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl uppercase tracking-[0.1em]"
                aria-label="Customer Login"
              >
                Customer
                <ArrowUpRight className="w-4 h-4 text-[#CDF546]" />
              </button>
              
              <button 
                onClick={handleVendorClick}
                className="w-full bg-gray-900 hover:bg-gray-800 active:scale-95 text-white px-5 py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl uppercase tracking-[0.1em]"
                aria-label="Vendor Login"
              >
                Vendor
                <ArrowUpRight className="w-4 h-4 text-[#CDF546]" />
              </button>
            </div>

            {/* App store buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://apps.apple.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all bg-white shadow-sm hover:shadow-md active:scale-95"
                aria-label="Download on the App Store"
              >
                <Apple className="w-6 h-6 fill-current flex-shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold text-gray-400 uppercase leading-none">Download on the</div>
                  <div className="text-sm font-bold text-gray-900 leading-tight">App Store</div>
                </div>
              </a>
              <a 
                href="https://play.google.com/store" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all bg-white shadow-sm hover:shadow-md active:scale-95"
                aria-label="Get it on Google Play"
              >
                <Play className="w-6 h-6 fill-current flex-shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold text-gray-400 uppercase leading-none">Get it on</div>
                  <div className="text-sm font-bold text-gray-900 leading-tight">Google Play</div>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Visual Content - Right side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full bg-[#CDF546] rounded-3xl lg:rounded-[48px] p-6 lg:p-8 relative overflow-hidden shadow-lg h-[500px] lg:h-[600px] order-1 lg:order-2 flex items-center justify-center"
          >
            {/* Phone mockup container - centered and properly sized */}
            <div className="relative">
              <div className="relative w-[180px] md:w-[200px] lg:w-[220px] aspect-[9/19] bg-black rounded-[28px] border-[4px] border-black shadow-2xl overflow-hidden">
                
                {/* Phone screen content */}
                <div className="absolute inset-0 bg-[#F1F5F9] flex flex-col overflow-hidden">
                  
                  {/* Map background pattern */}
                  <div className="absolute inset-0 opacity-40">
                    <svg className="w-full h-full" viewBox="0 0 320 600" preserveAspectRatio="none" aria-hidden="true">
                      <rect width="100%" height="100%" fill="#E2E8F0" />
                      <path d="M50 -10 L50 610" stroke="#FFFFFF" strokeWidth="10" fill="none" />
                      <path d="M150 -10 L150 610" stroke="#FFFFFF" strokeWidth="10" fill="none" />
                      <path d="M250 -10 L250 610" stroke="#FFFFFF" strokeWidth="10" fill="none" />
                      <path d="M-10 100 L330 100" stroke="#FFFFFF" strokeWidth="10" fill="none" />
                      <path d="M-10 250 L330 250" stroke="#FFFFFF" strokeWidth="10" fill="none" />
                      <path d="M-10 400 L330 400" stroke="#FFFFFF" strokeWidth="10" fill="none" />
                      <rect x="170" y="270" width="60" height="110" fill="#DCFCE7" />
                      <rect x="20" y="20" width="80" height="60" fill="#DCFCE7" />
                    </svg>
                  </div>

                  {/* Animated route */}
                  <div className="absolute inset-0">
                    <svg className="w-full h-full" viewBox="0 0 320 600" aria-hidden="true">
                      <defs>
                        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FB923C" />
                          <stop offset="100%" stopColor="#EA580C" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M150 100 L150 250 L200 250 L200 350 L250 350 L250 450"
                        stroke="url(#routeGradient)"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="5 2"
                        className="animate-pulse"
                      />
                      <circle cx="250" cy="450" r="8" fill="#EA580C" fillOpacity="0.2" />
                      <circle cx="250" cy="450" r="4" fill="#EA580C" stroke="white" strokeWidth="1.5" />
                    </svg>

                    {/* Moving delivery icon */}
                    <motion.div
                      initial={{ x: 130, y: 90 }}
                      animate={{ x: 180, y: 330 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute z-10"
                      aria-hidden="true"
                    >
                      <div className="bg-white p-1 rounded-full shadow-lg">
                        <div className="bg-[#EA580C] p-1 rounded-full text-white">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18.5" cy="17.5" r="3.5" />
                            <circle cx="5.5" cy="17.5" r="3.5" />
                            <circle cx="15" cy="5" r="1" />
                            <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>

                    {/* "You" marker */}
                    <div className="absolute bottom-[120px] right-[60px] animate-bounce">
                      <div className="bg-black text-white px-1.5 py-0.5 rounded-md text-[8px] font-bold shadow-lg whitespace-nowrap">
                        You
                      </div>
                    </div>
                  </div>

                  {/* Top status bar */}
                  <div className="absolute top-3 left-2 right-2 z-20">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-2 flex items-center gap-2 border border-gray-100">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[7px] font-bold text-gray-400 uppercase tracking-wider">Category</div>
                        <div className="text-[9px] font-bold text-gray-900 leading-none truncate">Vegetables</div>
                      </div>
                      <div className="text-[9px] font-bold text-[#EA580C] flex-shrink-0">⭐⭐⭐⭐</div>
                    </div>
                  </div>

                  {/* Bottom vendor card */}
                  <div className="absolute bottom-1.5 left-2 right-2 z-20">
                    <div className="bg-white rounded-xl shadow-xl p-2.5 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-white shadow-sm">
                          <img 
                            src="https://media.gettyimages.com/id/1054315090/photo/man-selling-pineapple-and-coconut.jpg?s=1024x1024&w=gi&k=20&c=35Hh3N7VwwHEqf16T9_F2vNeSOebP0rQwFlEzhRujmc=" 
                            alt="Vendor ManuBhai" 
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 text-[10px] truncate">ManuBhai</div>
                          <div className="text-[7px] text-gray-500 font-medium uppercase tracking-wide">GJ07 BO 8938</div>
                        </div>
                        <div className="text-right bg-orange-50 px-1.5 py-0.5 rounded-md text-[#EA580C] flex-shrink-0">
                          <div className="font-black text-xs leading-none">5</div>
                          <div className="text-[6px] font-bold uppercase">Mins</div>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button className="flex-1 bg-[#1A6950] text-white py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-wide shadow-sm">
                          Call Vendor
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-900 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-wide">
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification popup - simple and centered */}
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.6, type: "spring", bounce: 0.3 }}
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-40 bg-white rounded-2xl shadow-xl p-3 w-[240px] border border-gray-100 hidden md:block"
                style={{
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                }}
              >
                {/* Speech bubble tail */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-100"></div>
                </div>
                
                {/* Simple notification content */}
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#EA580C] flex items-center justify-center flex-shrink-0 text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  
                  {/* Message content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-gray-900 font-bold text-sm truncate">Vendorify</h4>
                      <span className="text-gray-400 text-xs font-medium flex-shrink-0 ml-2">now</span>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Hey Soham! Manubhai is just 1km away, Contact him to get Homedecor at your doorsteps.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom badge - positioned relative to container */}
            <div className="absolute bottom-6 right-0 bg-white/80 backdrop-blur-md py-3 pl-8 pr-8 rounded-l-full shadow-lg hidden lg:block">
              <div className="text-xs text-gray-900 uppercase tracking-widest text-center leading-none">
                Locate all<br />
                Vendors Near You
              </div>
            </div>
          </motion.div>
        </div>

        {/* Circular rotating element - only show on large screens */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 hidden xl:block">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="relative w-32 h-32 flex items-center justify-center"
            aria-hidden="true"
          >
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <defs>
                <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
              </defs>
              <text className="text-[7px] font-bold uppercase tracking-[0.2em] fill-gray-900">
                <textPath xlinkHref="#circlePath">
                  Same Product • Less Price • More Quality •
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-[#FDF9DC]">
                <ArrowUpRight className="w-6 h-6 text-gray-900 rotate-90" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TypewriterText({ text, delay = 0 }) {
  const segments = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: delay }
    }
  };

  const child = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 200 }
    }
  };

  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="visible"
      className="inline-block"
    >
      {segments.map((letter, index) => (
        <motion.span variants={child} key={index} className="inline-block">
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.span>
  );
}