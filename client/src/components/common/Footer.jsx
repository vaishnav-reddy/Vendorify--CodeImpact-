import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Twitter, Linkedin, Facebook, Instagram } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Footer() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <footer className="px-4 sm:px-6 py-16 sm:py-20 bg-[#01583F] rounded-t-[32px] sm:rounded-t-[48px] text-white">
      <div className="mx-auto max-w-7xl">
        {/* Top Section - Only show for non-authenticated users */}
        {!isAuthenticated && (
          <div className="mb-16 sm:mb-20 rounded-[32px] sm:rounded-[48px] bg-[#CDF546] p-8 sm:p-12 md:p-20 text-gray-900 relative overflow-hidden shadow-sm">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-[#01583F] rounded-bl-[60px] sm:rounded-bl-[90px] md:rounded-bl-[120px] -mr-6 sm:-mr-8 md:-mr-10 -mt-6 sm:-mt-8 md:-mt-10 opacity-10" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-10 text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading uppercase leading-[0.9] max-w-2xl">
                Ready to verify your <br />
                <span className="text-white">Vendor Network?</span>
              </h2>
              <button 
                onClick={() => navigate('/signup/vendor')}
                className="bg-[#01583F] hover:bg-[#01583F]/90 active:scale-[0.98] text-white px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-2xl sm:rounded-3xl font-bold uppercase tracking-widest text-base sm:text-lg flex items-center gap-2 sm:gap-3 hover:shadow-2xl transition-all focus:outline-none focus:ring-2 focus:ring-white touch-manipulation"
                aria-label="Get started as a vendor"
              >
                Get Started Now
                <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        )}

        {/* Footer Grid */}
        <div className="grid gap-8 sm:gap-10 md:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-16 sm:mb-20">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <img 
                src="/logo.svg" 
                alt="Vendorify Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain brightness-0 invert" 
              />
              <span className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-[#CDF546] tracking-tight uppercase italic">Vendorify</span>
            </Link>
            <p className="text-teal-100 font-sans font-medium leading-relaxed mb-6 sm:mb-8 opacity-70 text-sm sm:text-base">
              The world's most trusted vendor verification and compliance monitoring platform.
            </p>
            <div className="flex gap-3 sm:gap-4">
              {[
                { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
                { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
                { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
                { href: "https://instagram.com", icon: Instagram, label: "Instagram" }
              ].map(({ href, icon: Icon, label }) => (
                <a 
                  key={label}
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-teal-500/30 flex items-center justify-center text-[#CDF546] hover:bg-[#CDF546] hover:text-[#01583F] transition-all focus:outline-none focus:ring-2 focus:ring-[#CDF546] touch-manipulation"
                  aria-label={label}
                >
                  <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: "Product",
              links: [
                { name: "Features", href: "/#features" },
                { name: "Pricing", href: "/#pricing" },
                { name: "Security", href: "/security" },
                { name: "Integrations", href: "/integrations" },
              ],
            },
            {
              title: "Company",
              links: [
                { name: "About", href: "/about" },
                { name: "Customers", href: "/customers" },
                { name: "Careers", href: "/careers" },
                { name: "Blog", href: "/blog" },
              ],
            },
            {
              title: "Resources",
              links: [
                { name: "Documentation", href: "/docs" },
                { name: "Help Center", href: "/help" },
                { name: "Terms", href: "/terms" },
                { name: "Privacy", href: "/privacy" },
              ],
            },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-heading uppercase text-xl sm:text-2xl text-[#CDF546] mb-6 sm:mb-8">{col.title}</h4>
              <ul className="space-y-3 sm:space-y-4 text-teal-100 font-sans font-medium">
                {col.links.map((item, j) => (
                  <li key={j}>
                    <Link 
                      to={item.href} 
                      className="hover:text-[#CDF546] transition-colors opacity-70 hover:opacity-100 text-sm sm:text-base"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-teal-500/20 pt-8 sm:pt-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-xs sm:text-sm font-bold uppercase tracking-widest text-teal-300">
          <p>© 2026 Vendorify . All rights reserved.</p>
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8 flex-wrap justify-center">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
