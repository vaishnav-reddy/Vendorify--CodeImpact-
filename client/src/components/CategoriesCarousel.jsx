
import React, { useRef, useState } from "react";

export default function CategoriesCarousel() {
  const ref = useRef(null);
  const [imageErrors, setImageErrors] = useState({});

  const categories = [
    {
      title: "Vegetables",
      hindi: "ताज़ी सब्ज़ियाँ",
      image: "https://picsum.photos/seed/vegetables/400/400",
      gradient: "from-[#1A6950] to-[#2D8A6A]",
      shadow: "group-hover:shadow-[0_20px_50px_-12px_rgba(26,105,80,0.5)]",
    },
    {
      title: "Fruits",
      hindi: "ताज़े फल",
      image: "https://picsum.photos/400/400?random=2",
      gradient: "from-[#F56013] to-[#FF8A4C]",
      shadow: "group-hover:shadow-[0_20px_50px_-12px_rgba(245,96,19,0.5)]",
    },
    {
      title: "Street Food",
      hindi: "चटपटी चाट",
      image: "https://picsum.photos/400/400?random=3",
      gradient: "from-[#84A02A] to-[#CDF546]",
      shadow: "group-hover:shadow-[0_20px_50px_-12px_rgba(205,245,70,0.5)]",
    },
    {
      title: "Tea & Coffee",
      hindi: "गरमा गरम चाय",
      image: "https://picsum.photos/400/400?random=4",
      gradient: "from-[#8D5824] to-[#A67C52]",
      shadow: "group-hover:shadow-[0_20px_50px_-12px_rgba(141,88,36,0.5)]",
    },
    {
      title: "Flowers",
      hindi: "ताज़े फूल",
      image: "https://picsum.photos/400/400?random=5",
      gradient: "from-[#C2185B] to-[#E91E63]",
      shadow: "group-hover:shadow-[0_20px_50px_-12px_rgba(233,30,99,0.5)]",
    },
    {
      title: "Coconut Water",
      hindi: "नारियल पानी",
      image: "https://picsum.photos/400/400?random=6",
      gradient: "from-[#388E3C] to-[#4CAF50]",
      shadow: "group-hover:shadow-[0_20px_50px_-12px_rgba(76,175,80,0.5)]",
    },
    {
      title: "Home Repairs",
      hindi: "मरम्मत सेवा",
      image: "https://picsum.photos/400/400?random=7",
      gradient: "from-[#455A64] to-[#607D8B]",
      shadow: "group-hover:shadow-[0_20px_50px_-12px_rgba(96,125,139,0.5)]",
    },
    {
      title: "Seasonal",
      hindi: "मौसमी बहार",
      image: "https://picsum.photos/400/400?random=8",
      gradient: "from-[#FFB300] to-[#FFC107]",
      shadow: "group-hover:shadow-[0_20px_50px_-12px_rgba(255,193,7,0.5)]",
    },
  ];

  const carouselItems = [...categories, ...categories];

  const handleImageError = (index, imageUrl) => {
    console.error('Image failed to load:', imageUrl);
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const handleImageLoad = (imageUrl) => {
    console.log('Image loaded successfully:', imageUrl);
  };

  return (
    <section
      id="categories"
      ref={ref}
      className="py-12 md:py-16 lg:py-20 xl:py-24 bg-white overflow-hidden"
    >
      <div className="mb-8 md:mb-12 lg:mb-16 text-center px-4 max-w-4xl mx-auto">
        <p className="text-[#F56013] font-bold tracking-[0.2em] mb-3 md:mb-4 uppercase text-sm md:text-base">
          Find Everything Nearby
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-heading text-gray-900 uppercase leading-tight">
          Categories of <span className="text-[#1A6950]">Vendors</span>
          <br />
          Using Our App
        </h2>
      </div>

      <div className="relative w-full">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 lg:w-32 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 lg:w-32 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

        <div className="flex w-max gap-4 md:gap-6 lg:gap-8 xl:gap-10 animate-marquee hover:[animation-play-state:paused] pl-4 md:pl-8">
          {carouselItems.map((cat, i) => (
            <div
              key={i}
              className="group relative w-[180px] h-[240px] md:w-[220px] md:h-[280px] lg:w-[260px] lg:h-[320px] xl:w-[280px] xl:h-[360px] flex-shrink-0 cursor-pointer perspective-1000"
            >
              <div
                className={`absolute inset-0 rounded-2xl md:rounded-3xl lg:rounded-[32px] xl:rounded-[40px] bg-gradient-to-br ${cat.gradient}
                transform transition-all duration-500 group-hover:scale-[1.02]
                group-hover:-rotate-1 ${cat.shadow}`}
              >
                <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full blur-2xl translate-x-4 md:translate-x-6 lg:translate-x-10 -translate-y-4 md:-translate-y-6 lg:-translate-y-10" />
                <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-black/10 rounded-full blur-2xl -translate-x-4 md:-translate-x-6 lg:-translate-x-10 translate-y-4 md:translate-y-6 lg:translate-y-10" />
              </div>

              <div className="relative h-full flex flex-col items-center justify-end p-3 md:p-4 lg:p-6 pb-4 md:pb-6 lg:pb-8 z-10">
                <div className="absolute top-4 md:top-6 lg:top-8 left-1/2 -translate-x-1/2 w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-48 xl:h-48 transition-all duration-500 group-hover:scale-125 group-hover:-translate-y-6 md:group-hover:-translate-y-8 lg:group-hover:-translate-y-12 drop-shadow-2xl">
                  <div className="w-full h-full rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden border-2 md:border-3 lg:border-4 border-white/20 shadow-inner rotate-3 group-hover:rotate-0 transition-all duration-500 relative">
                    <img
                      src={cat.image}
                      alt={`${cat.title} category`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // If image fails to load, use a reliable fallback
                        console.log('Image failed to load:', e.target.src);
                        e.target.src = `https://picsum.photos/400/400?random=${i + 1}`;
                      }}
                      onLoad={() => handleImageLoad(cat.image)}
                      loading="lazy"
                    />
                    {/* Show a placeholder if image is still loading or failed */}
                    <div className="absolute inset-0 bg-white/10 flex items-center justify-center opacity-0 transition-opacity duration-300" 
                         style={{opacity: imageErrors[i] ? 1 : 0}}>
                      <div className="text-white/60 text-lg font-bold">
                        {cat.title}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center transition-all duration-500 group-hover:translate-y-1 lg:group-hover:translate-y-2">
                  <h3 className="text-sm md:text-lg lg:text-xl xl:text-2xl font-heading uppercase text-white mb-1 md:mb-2 drop-shadow-md">
                    {cat.title}
                  </h3>
                  <p className="text-white/90 font-bold text-[10px] md:text-xs lg:text-sm uppercase tracking-wider bg-white/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full backdrop-blur-sm">
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
        
        /* Pause animation on touch devices when touching */
        @media (hover: none) and (pointer: coarse) {
          .animate-marquee:active {
            animation-play-state: paused;
          }
        }
      `}</style>
    </section>
  );
}
