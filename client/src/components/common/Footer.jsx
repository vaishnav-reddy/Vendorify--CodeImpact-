import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Twitter, Linkedin, Facebook, Instagram } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Footer() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <footer className="px-6 py-20 bg-[#01583F] rounded-t-[48px] text-white">
      <div className="mx-auto max-w-7xl">
        {/* Top Section - Only show for non-authenticated users */}
        {!isAuthenticated && (
          <div className="mb-20 rounded-[48px] bg-[#CDF546] p-12 md:p-20 text-gray-900 relative overflow-hidden shadow-sm">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#01583F] rounded-bl-[120px] -mr-10 -mt-10 opacity-10" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
              <h2 className="text-5xl md:text-7xl font-heading uppercase leading-[0.9] max-w-2xl">
                Ready to verify your <br />
                <span className="text-white">Vendor Network?</span>
              </h2>
              <button 
                onClick={() => navigate('/signup/vendor')}
                className="bg-[#01583F] text-white px-12 py-6 rounded-3xl font-bold uppercase tracking-widest text-lg flex items-center gap-3 hover:shadow-2xl transition-all focus:outline-none focus:ring-2 focus:ring-white"
              >
                Get Started Now
                <ArrowUpRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}

        {/* Footer Grid */}
        <div className="grid gap-12 md:grid-cols-4 mb-20">
              <div className="md:col-span-1">
                <Link to="/" className="flex items-center gap-4 mb-8">
                  <img 
                    src="/logo.svg" 
                    alt="Vendorify Logo" 
                    className="w-12 h-12 object-contain brightness-0 invert" 
                  />
                  <span className="text-4xl font-heading font-black text-[#CDF546] tracking-tight uppercase italic">Vendorify</span>
                </Link>
            <p className="text-teal-100 font-sans font-medium leading-relaxed mb-8 opacity-70">
              The world's most trusted vendor verification and compliance monitoring platform.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-teal-500/30 flex items-center justify-center text-[#CDF546] hover:bg-[#CDF546] hover:text-[#01583F] transition-all focus:outline-none focus:ring-2 focus:ring-[#CDF546]"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-teal-500/30 flex items-center justify-center text-[#CDF546] hover:bg-[#CDF546] hover:text-[#01583F] transition-all focus:outline-none focus:ring-2 focus:ring-[#CDF546]"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-teal-500/30 flex items-center justify-center text-[#CDF546] hover:bg-[#CDF546] hover:text-[#01583F] transition-all focus:outline-none focus:ring-2 focus:ring-[#CDF546]"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-teal-500/30 flex items-center justify-center text-[#CDF546] hover:bg-[#CDF546] hover:text-[#01583F] transition-all focus:outline-none focus:ring-2 focus:ring-[#CDF546]"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
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
              <h4 className="font-heading uppercase text-2xl text-[#CDF546] mb-8">{col.title}</h4>
              <ul className="space-y-4 text-teal-100 font-sans font-medium">
                {col.links.map((item, j) => (
                  <li key={j}>
                    <Link to={item.href} className="hover:text-[#CDF546] transition-colors opacity-70 hover:opacity-100">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-teal-500/20 pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-bold uppercase tracking-widest text-teal-300">
          <p>© 2026 Vendorify . All rights reserved.</p>
          <div className="flex items-center gap-8">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
