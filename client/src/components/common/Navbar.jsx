import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, ArrowRight, Bell, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ role = "landing" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (role !== 'landing') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    setIsOpen(false);
  };

  const navLinks = {
    landing: [
      { name: 'Categories', action: () => scrollToSection('categories') },
      { name: 'How it Works', action: () => scrollToSection('how-it-works') },
    ],
    customer: [
      { name: 'Dashboard', to: '/customer' },
      { name: 'Orders', to: '/customer/orders' },
      { name: 'Cart', to: '/customer/cart' },
    ],
    vendor: [
      { name: 'Stats', to: '/vendor' },
      { name: 'Orders', to: '/vendor/orders' },
      { name: 'Shop Menu', to: '/vendor' },
    ]
  };

  const currentLinks = navLinks[role] || navLinks.landing;

  return (
    <nav className="fixed top-2 z-50 w-full flex justify-center px-4 md:px-0 transition-all duration-300">
        <div className={`bg-white/95 backdrop-blur-xl px-4 md:px-8 lg:px-12 py-4 flex items-center justify-between gap-4 w-full max-w-7xl rounded-b-3xl shadow-lg border border-gray-100 ${
          isScrolled ? 'ring-1 ring-gray-200/50 scale-[1.02]' : ''
        }`}>
        
          {/* Logo - Left on desktop */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0" aria-label="Vendorify Home">
            <img 
              src="/logo.svg" 
              alt="Vendorify Logo" 
              className="w-12 h-12 md:w-14 md:h-14 object-contain"
            />
            <span className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase hidden sm:block">Vendorify</span>
          </Link>

          {/* Center Links */}
          <div className="hidden lg:flex items-center gap-6">
            {role === 'landing' && (
              <div className="relative group">
                <button 
                  className="flex items-center gap-1.5 text-gray-800 hover:text-emerald-700 transition-all font-bold text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded px-2 py-1"
                  aria-haspopup="true"
                  aria-label="Products menu"
                >
                  Products
                  <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-emerald-700 transition-colors" />
                </button>
                <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl py-4 w-56 z-50">
                  <button onClick={() => scrollToSection('categories')} className="block w-full text-left px-6 py-3 hover:bg-yellow-50 text-gray-800 text-xs font-bold uppercase tracking-wider transition-colors">
                    Categories
                  </button>
                  <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left px-6 py-3 hover:bg-yellow-50 text-gray-800 text-xs font-bold uppercase tracking-wider transition-colors">
                    How it Works
                  </button>
                </div>
              </div>
            )}
            {currentLinks.map((link, idx) => (
              <div key={idx}>
                {link.action ? (
                  <button 
                    onClick={link.action}
                    className="text-gray-800 hover:text-emerald-700 transition-colors font-bold text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded px-2 py-1"
                  >
                    {link.name}
                  </button>
                ) : (
                  <Link 
                    to={link.to} 
                    className="text-gray-800 hover:text-emerald-700 transition-colors font-bold text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded px-2 py-1"
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6 flex-shrink-0">
            {role === 'landing' ? (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="text-gray-800 hover:text-emerald-700 transition-colors font-bold text-sm uppercase tracking-wider"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="bg-[#CDF546] hover:bg-[#b8dd3e] text-gray-900 px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
                >
                  Sign Up
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            ) : (
            <div className="flex items-center gap-4">
              <button className="p-2.5 text-gray-400 hover:text-emerald-700 hover:bg-gray-100 rounded-lg transition-all">
                <Bell size={20} />
              </button>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  Log Out
                  <LogOut size={16} className="text-[#CDF546]" />
                </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
          {isOpen ? <X className="h-6 w-6 text-gray-900" /> : <Menu className="h-6 w-6 text-gray-900" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-[calc(100%+12px)] left-4 right-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-100 flex flex-col gap-6 z-50"
          >
            {currentLinks.map((link, idx) => (
              <div key={idx}>
                {link.action ? (
                  <button 
                    onClick={link.action}
                    className="text-gray-900 font-bold text-lg uppercase tracking-wider py-3 text-left hover:bg-yellow-50 px-4 rounded-xl transition-colors"
                  >
                    {link.name}
                  </button>
                ) : (
                  <Link 
                    to={link.to} 
                    onClick={() => setIsOpen(false)}
                    className="text-gray-900 font-bold text-lg uppercase tracking-wider py-3 block hover:bg-yellow-50 px-4 rounded-xl transition-colors"
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
            <hr className="border-gray-100" />
            {role === 'landing' ? (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-gray-900 font-bold text-lg uppercase tracking-wider py-3 hover:bg-yellow-50 px-4 rounded-xl">
                  Login
                </Link>
                <button 
                  onClick={() => { navigate('/signup'); setIsOpen(false); }}
                  className="bg-[#CDF546] hover:bg-[#b8dd3e] text-gray-900 px-8 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all mx-auto"
                >
                  Sign Up
                  <ArrowRight className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button 
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="bg-gray-900 hover:bg-black text-white px-8 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all mx-auto"
              >
                Log Out
                <LogOut className="h-5 w-5 text-[#CDF546]" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
