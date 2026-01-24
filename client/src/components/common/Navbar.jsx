import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Bell,
  LogOut,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ role = "landing" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else if (role !== "landing") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    setIsOpen(false);
  };

  const navLinks = {
    landing: [
      { name: "Categories", action: () => scrollToSection("categories") },
      { name: "How it Works", action: () => scrollToSection("how-it-works") },
    ],
    customer: [
      { name: "Dashboard", to: "/customer" },
      { name: "Orders", to: "/customer/orders" },
      { name: "Cart", to: "/customer/cart" },
    ],
    vendor: [
      { name: "Stats", to: "/vendor" },
      { name: "Orders", to: "/vendor/orders" },
      { name: "Shop Menu", to: "/vendor" },
    ],
  };

  const currentLinks = navLinks[role] || navLinks.landing;

  return (
    <nav className="fixed top-2 z-50 w-full flex justify-center px-4 transition-all duration-300">
      <div
        className={`bg-white/95 backdrop-blur-xl px-6 py-4 flex items-center justify-between w-full max-w-7xl rounded-3xl shadow-lg border ${
          isScrolled ? "ring-1 ring-gray-200/50 scale-[1.02]" : ""
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Vendorify" className="w-12 h-12 md:w-14 md:h-14" />
          <span className="hidden sm:block text-xl font-black uppercase">
            Vendorify
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6">
          {role === "landing" && (
            <div className="relative group">
              <button className="flex items-center gap-1 text-xs font-bold uppercase hover:text-[#1A6950] transition-colors">
                Products
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute hidden group-hover:block bg-white rounded-xl shadow-xl mt-2 w-56 border border-gray-100">
                <button
                  onClick={() => scrollToSection("categories")}
                  className="block w-full px-6 py-3 text-left hover:bg-yellow-50 transition-colors"
                >
                  Categories
                </button>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="block w-full px-6 py-3 text-left hover:bg-yellow-50 transition-colors"
                >
                  How it Works
                </button>
              </div>
            </div>
          )}
          {currentLinks.map((link, i) =>
            link.action ? (
              <button key={i} onClick={link.action} className="nav-link">
                {link.name}
              </button>
            ) : (
              <Link key={i} to={link.to} className="nav-link">
                {link.name}
              </Link>
            )
          )}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {role === "landing" ? (
            <>
              <button
                onClick={() => navigate("/role-selection")}
                className="bg-[#1A6950] hover:bg-[#145a44] active:scale-[0.98] px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md text-white"
              >
                Get Started Now <ArrowRight size={16} className="text-[#CDF546]" />
              </button>
            </>
          ) : (
            <>
              <button className="icon-btn" aria-label="Notifications">
                <Bell size={20} />
              </button>
              <button
                onClick={() => navigate(`/${role}/profile`)}
                className="icon-btn"
                aria-label="Profile"
              >
                <User size={20} />
              </button>
              <button onClick={handleLogout} className="logout-btn">
                Log Out <LogOut size={16} />
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-[calc(100%+12px)] left-4 right-4 bg-white rounded-3xl shadow-2xl p-6 border border-gray-100"
          >
            {currentLinks.map((link, i) =>
              link.action ? (
                <button
                  key={i}
                  onClick={link.action}
                  className="mobile-link"
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={i}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="mobile-link"
                >
                  {link.name}
                </Link>
              )
            )}
            <hr className="my-4 border-gray-100" />
            {role === "landing" ? (
              <>
                <button
                  onClick={() => {
                    navigate("/role-selection");
                    setIsOpen(false);
                  }}
                  className="signup-mobile"
                >
                  Get Started Now <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to={`/${role}/profile`}
                  className="mobile-link flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={18} /> Profile
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }} 
                  className="logout-mobile"
                >
                  Log Out <LogOut size={16} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}