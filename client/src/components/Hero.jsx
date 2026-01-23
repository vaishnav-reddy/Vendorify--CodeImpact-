import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { ArrowUpRight, Apple, Play, ShoppingBag, Store } from "lucide-react";

export default function Hero({ onContinueCustomer, onContinueVendor }) {
  const [loopKey, setLoopKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoopKey(prev => prev + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-4 px-6 overflow-hidden bg-[#FDF9DC]">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center h-full">

        {/* Left Container - Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-[48px] p-8 md:p-12 flex flex-col justify-center relative overflow-hidden group shadow-sm h-full"
        >
          <div className="relative z-10 flex flex-col h-full justify-center">
            <h1 className="text-4xl md:text-6xl lg:text-[60px] font-bold text-gray-900 leading-[1.1] mb-6 font-helvetica tracking-tight">
              गली गली के<br />
              ठेले वाले <br />
              आपको यहाँ मिलेंगे.
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-md font-archivo font-medium">
              <TypewriterText key={`p-2-${loopKey}`} text="Desi Products, World-Class Quality, Street Prices" delay={1.5} />
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button 
                onClick={onContinueCustomer}
                className="bg-[#CDF546] hover:bg-[#b8dd3e] text-gray-900 px-6 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
              >
                <ShoppingBag className="h-5 w-5" />
                Customer
                <ArrowUpRight className="h-5 w-5" />
              </button>
              <button 
                onClick={onContinueVendor}
                className="bg-[#1A6950] hover:bg-[#145a44] text-white px-6 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
              >
                <Store className="h-5 w-5" />
                Vendor
                <ArrowUpRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-4 mt-auto">
              <a 
                href="https://apps.apple.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-colors bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#CDF546]"
                aria-label="Download on the App Store"
              >
                <Apple className="h-5 w-5 fill-current" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-gray-400 leading-none">Download on the</div>
                  <div className="text-sm font-bold text-gray-900 leading-tight">App Store</div>
                </div>
              </a>
              <a 
                href="https://play.google.com/store" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-colors bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#CDF546]"
                aria-label="Get it on Google Play"
              >
                <Play className="h-5 w-5 fill-current" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-gray-400 leading-none">Get it on</div>
                  <div className="text-sm font-bold text-gray-900 leading-tight">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Right Container - Image/Graphic Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#CDF546] rounded-[48px] p-6 relative overflow-hidden flex items-center justify-center shadow-sm h-full min-h-[500px]"
        >
          {/* Floating Card 1 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute top-10 z-30 bg-white/80 backdrop-blur-xl p-4 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-72 border border-white/50"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EA580C] flex items-center justify-center shrink-0 shadow-sm text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <div className="flex items-baseline justify-between w-full gap-8">
                  <div className="text-gray-900 font-bold text-sm">ManuBhai</div>
                  <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wide">now</div>
                </div>
                <div className="text-gray-600 text-xs font-medium leading-relaxed mt-0.5">
                  Hey! I'm 1km away. Reaching your location in 5 mins 🛵
                </div>
              </div>
            </div>
          </motion.div>

          {/* Phone Mockup Container */}
          <div className="relative w-full max-w-[280px] aspect-[9/19] bg-black rounded-[40px] border-[8px] border-black shadow-2xl overflow-hidden mt-10">
            {/* Phone Content Simulation */}
            <div className="absolute inset-0 bg-[#F1F5F9] flex flex-col overflow-hidden">
              {/* Map Background Pattern - Simulated */}
              <div className="absolute inset-0 opacity-40">
                <svg className="w-full h-full" viewBox="0 0 320 600" preserveAspectRatio="none">
                  <rect width="100%" height="100%" fill="#E2E8F0" />
                  <path d="M50 -10 L50 610" stroke="#FFFFFF" strokeWidth="15" fill="none" />
                  <path d="M150 -10 L150 610" stroke="#FFFFFF" strokeWidth="15" fill="none" />
                  <path d="M250 -10 L250 610" stroke="#FFFFFF" strokeWidth="15" fill="none" />
                  <path d="M-10 100 L330 100" stroke="#FFFFFF" strokeWidth="15" fill="none" />
                  <path d="M-10 250 L330 250" stroke="#FFFFFF" strokeWidth="15" fill="none" />
                  <path d="M-10 400 L330 400" stroke="#FFFFFF" strokeWidth="15" fill="none" />
                  <rect x="170" y="270" width="60" height="110" fill="#DCFCE7" />
                  <rect x="20" y="20" width="80" height="60" fill="#DCFCE7" />
                </svg>
              </div>

              {/* Route Layer */}
              <div className="absolute inset-0">
                <svg className="w-full h-full" viewBox="0 0 320 600">
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FB923C" />
                      <stop offset="100%" stopColor="#EA580C" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M150 100 L150 250 L200 250 L200 350 L250 350 L250 450"
                    stroke="url(#routeGradient)"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="8 4"
                    className="animate-pulse"
                  />

                  <circle cx="250" cy="450" r="12" fill="#EA580C" fillOpacity="0.2" />
                  <circle cx="250" cy="450" r="6" fill="#EA580C" stroke="white" strokeWidth="2" />
                </svg>

                <motion.div
                  initial={{ x: 130, y: 90 }}
                  animate={{ x: 180, y: 330 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute z-10"
                >
                  <div className="bg-white p-1.5 rounded-full shadow-lg">
                    <div className="bg-[#EA580C] p-1.5 rounded-full text-white">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18.5" cy="17.5" r="3.5" />
                        <circle cx="5.5" cy="17.5" r="3.5" />
                        <circle cx="15" cy="5" r="1" />
                        <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                <div className="absolute top-[430px] left-[230px] animate-bounce">
                  <div className="bg-black text-white px-2 py-1 rounded-lg text-[10px] font-bold mb-1 shadow-lg whitespace-nowrap">
                    You
                  </div>
                </div>
              </div>

              {/* Top Header UI */}
              <div className="absolute top-6 left-4 right-4 z-20">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-3 flex items-center gap-3 border border-gray-100">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</div>
                    <div className="text-xs font-bold text-gray-900 leading-none">Vegetables</div>
                  </div>
                  <div className="text-xs font-bold text-[#EA580C]">⭐⭐⭐⭐</div>
                </div>
              </div>


              {/* Bottom Sheet UI */}
              <div className="absolute bottom-2 left-4 right-4 z-20">
                <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                      <img src="https://media.gettyimages.com/id/1054315090/photo/man-selling-pineapple-and-coconut.jpg?s=1024x1024&w=gi&k=20&c=35Hh3N7VwwHEqf16T9_F2vNeSOebP0rQwFlEzhRujmc=" alt="Driver" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm truncate">ManuBhai</div>
                      <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">GJ07 BO 8938</div>
                    </div>
                    <div className="text-right bg-orange-50 px-2 py-1 rounded-lg text-[#EA580C]">
                      <div className="font-black text-lg leading-none">5</div>
                      <div className="text-[8px] font-bold uppercase">Mins</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-[#1A6950] text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide shadow-sm">
                      Call Vendor
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-900 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide">
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card / Badge */}
          <div className="absolute bottom-8 right-0 bg-white/80 backdrop-blur-md py-4 pl-12 pr-12 rounded-l-full shadow-lg">
            <div className="text-xs text-gray-900 uppercase tracking-widest text-center leading-none">
              Locate all<br />
              Vendors Near You
            </div>
          </div>
        </motion.div>

        {/* Circular Learn More element */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 hidden md:block">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="relative w-32 h-32 flex items-center justify-center"
          >
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <defs>
                <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
              </defs>
              <text className="text-[8px] font-bold uppercase tracking-[0.2em] fill-gray-900">
                <textPath xlinkHref="#circlePath">
                  Same Product • Less Price • More Quality •
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-[#FDF9DC]">
                <ArrowUpRight className="h-6 w-6 text-gray-900 rotate-90" />
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
