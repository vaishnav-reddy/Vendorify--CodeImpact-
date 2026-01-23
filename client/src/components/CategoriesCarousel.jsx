import React, { useRef } from "react";

export default function CategoriesCarousel() {
  const ref = useRef(null);

  const categories = [
    {
      title: "Vegetables",
      hindi: "ताज़ी सब्ज़ियाँ",
      image: "https://images.unsplash.com/photo-1620023412573-0aa83984d72d?q=80&w=600&auto=format&fit=crop",
      gradient: "from-[#1A6950] to-[#2D8A6A]",
      shadow: "group-hover:shadow-[0_20px_50px_-12px_rgba(26,105,80,0.5)]"
    },
    {
      title: "Fruits",
      hindi: "ताज़े फल",
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=600&auto=format&fit=crop",
      gradient: "from-[#F56013] to-[#FF8A4C]",
      shadow: "group-hover:shadow-[0_20px_50px_-12px_rgba(245,96,19,0.5)]"
    },
    {
      title: "Street Food",
      hindi: "चटपटी चाट",
      image: "https://images.unsplash.com/photo-1626135832367-73b378052445?q=80&w=600&auto=format&fit=crop",
      gradient: "from-[#84A02A] to-[#CDF546]",
      shadow: "group-hover:shadow-[0_20px_50px_-12px_rgba(205,245,70,0.5)]"
    },
    {
      title: "Tea & Coffee",
      hindi: "गरमा गरम चाय",
      image: "https://images.unsplash.com/photo-1626085354924-f7b5384bc871?q=80&w=600&auto=format&fit=crop",
      gradient: "from-[#8D5824] to-[#A67C52]",
      shadow: "group-hover:shadow-[0_20px_50px_-12px_rgba(141,88,36,0.5)]"
    },
    {
      title: "Flowers",
      hindi: "ताज़े फूल",
      image: "https://images.unsplash.com/photo-1596436647971-d40b49cb475c?q=80&w=600&auto=format&fit=crop",
      gradient: "from-[#C2185B] to-[#E91E63]",
      shadow: "group-hover:shadow-[0_20px_50px_-12px_rgba(233,30,99,0.5)]"
    },
    {
      title: "Coconut Water",
      hindi: "नारियल पानी",
      image: "https://images.unsplash.com/photo-1622484346904-4b476f571b0b?q=80&w=600&auto=format&fit=crop",
      gradient: "from-[#388E3C] to-[#4CAF50]",
      shadow: "group-hover:shadow-[0_20px_50px_-12px_rgba(76,175,80,0.5)]"
    },
    {
      title: "Home Repairs",
      hindi: "मरम्मत सेवा",
      image: "https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?q=80&w=600&auto=format&fit=crop",
      gradient: "from-[#455A64] to-[#607D8B]",
      shadow: "group-hover:shadow-[0_20px_50px_-12px_rgba(96,125,139,0.5)]"
    },
    {
      title: "Seasonal",
      hindi: "मौसमी बहार",
      image: "https://images.unsplash.com/photo-1514693120-e2ce1e3eb89e?q=80&w=600&auto=format&fit=crop",
      gradient: "from-[#FFB300] to-[#FFC107]",
      shadow: "group-hover:shadow-[0_20px_50px_-12px_rgba(255,193,7,0.5)]"
    }
  ];

  const carouselItems = [...categories, ...categories];

  return (
    <section id="categories" ref={ref} className="py-24 bg-white overflow-hidden">
      <div className="mb-16 text-center px-6">
        <p className="text-[#F56013] font-bold tracking-[0.2em] mb-4 uppercase">Find Everything Nearby</p>
        <h2 className="text-4xl md:text-6xl font-heading text-gray-900 uppercase leading-none">
          Categories of <span className="text-[#1A6950]">Vendors</span> <br />
          Using Our App
        </h2>
      </div>

      {/* Infinite Carousel Container */}
      <div className="relative w-full">
        {/* Gradient Masks for edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

        {/* Infinite Scroll Track */}
        <div className="flex w-max gap-10 animate-marquee hover:[animation-play-state:paused] pl-8">
          {carouselItems.map((cat, i) => (
            <div key={i} className="group relative w-[280px] h-[360px] flex-shrink-0 cursor-pointer perspective-1000">
              <div className={`absolute inset-0 rounded-[40px] bg-gradient-to-br ${cat.gradient} transform transition-all duration-500 group-hover:scale-[1.02] group-hover:-rotate-1 ${cat.shadow}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl transform -translate-x-10 translate-y-10" />
              </div>

              <div className="relative h-full flex flex-col items-center justify-end p-6 pb-8 z-10">
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 h-48 transition-all duration-500 transform group-hover:scale-125 group-hover:-translate-y-12 drop-shadow-2xl">
                  <div className="w-full h-full rounded-3xl overflow-hidden border-4 border-white/20 shadow-inner rotate-3 group-hover:rotate-0 transition-all duration-500">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="text-center transform transition-all duration-500 group-hover:translate-y-2">
                  <h3 className="text-2xl font-heading uppercase text-white leading-none mb-2 drop-shadow-md">
                    {cat.title}
                  </h3>
                  <p className="text-white/90 font-sans font-bold text-sm uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    {cat.hindi}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 40s linear infinite;
          }
        `}</style>
    </section>
  );
}
