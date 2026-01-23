import React, { useState, useRef } from 'react';
import { Camera, X, Check, Type, Search, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const SCRAPED_DATA = {
  'butter chicken': {
    name: "Butter Chicken",
    price: 280,
    category: "food",
    description: "Rich, creamy tomato curry with tender chicken pieces.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=400",
    calories: "450 kcal"
  },
  'biryani': {
    name: "Chicken Biryani",
    price: 220,
    category: "food",
    description: "Aromatic basmati rice cooked with spices and chicken.",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=400",
    calories: "600 kcal"
  },
  'tea': {
    name: "Masala Chai",
    price: 20,
    category: "beverage",
    description: "Spiced Indian tea brewed with milk and ginger.",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=400",
    calories: "120 kcal"
  }
};

// Product recognition database (mock AI recognition)
const PRODUCT_RECOGNITION = {
  // English
  'samosa': { name: 'Samosa', category: 'food', defaultPrice: 20, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=400" },
  'pani puri': { name: 'Pani Puri', category: 'food', defaultPrice: 30, image: "https://images.unsplash.com/photo-1593560708920-63984be368ad?auto=format&fit=crop&q=80&w=400" },
  'dosa': { name: 'Dosa', category: 'food', defaultPrice: 40, image: "https://images.unsplash.com/photo-1668236543090-d2f8969528d6?auto=format&fit=crop&q=80&w=400" },
  'idli': { name: 'Idli', category: 'food', defaultPrice: 15, image: "https://images.unsplash.com/photo-1589301760014-d929645e3b88?auto=format&fit=crop&q=80&w=400" },
};

const AIProductListing = ({ onClose, onProductAdded }) => {
  const [mode, setMode] = useState('photo'); // 'photo' | 'text'
  const [step, setStep] = useState('input'); // input, processing, confirm
  const [photo, setPhoto] = useState(null);
  const [textQuery, setTextQuery] = useState('');
  const [productDetails, setProductDetails] = useState(null);

  const fileInputRef = useRef(null);

  const simulateProcessing = async (type, data) => {
    setStep('processing');

    try {
      let result = null;

      if (type === 'photo') {
        // For photo mode, use the filename to generate product
        const fileName = data.name.toLowerCase();
        const key = Object.keys(PRODUCT_RECOGNITION).find(k => fileName.includes(k));
        
        if (key) {
          // Call backend AI endpoint with recognized product name
          const response = await fetch('/api/vendors/ai/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('vendorify_token')}`
            },
            body: JSON.stringify({ query: PRODUCT_RECOGNITION[key].name })
          });

          if (response.ok) {
            result = await response.json();
          } else {
            // Fallback to local data
            result = { ...PRODUCT_RECOGNITION[key], name: PRODUCT_RECOGNITION[key].name };
          }
        } else {
          result = { ...PRODUCT_RECOGNITION['samosa'], name: 'Unknown Item' };
        }
      } else if (type === 'text') {
        // For text mode, call backend AI endpoint
        try {
          const response = await fetch('/api/vendors/ai/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('vendorify_token')}`
            },
            body: JSON.stringify({ query: data })
          });

          if (response.ok) {
            result = await response.json();
          } else {
            throw new Error('AI API failed');
          }
        } catch (error) {
          console.error('AI API error:', error);
          // Fallback to local data
          const lowerName = data.toLowerCase();
          const key = Object.keys(SCRAPED_DATA).find(k => lowerName.includes(k));

          if (!key) {
            result = {
              name: data,
              price: 100,
              category: 'food',
              description: `Freshly prepared ${data}.`,
              image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
              calories: "Unknown"
            };
          } else {
            result = SCRAPED_DATA[key];
          }
        }
      }

      setProductDetails({
        name: result.name,
        price: result.defaultPrice || result.price,
        category: result.category,
        description: result.description || "Fresh and delicious.",
        image: result.image || photo,
        calories: result.calories || result.cal
      });
      setStep('confirm');
    } catch (error) {
      console.error('Processing error:', error);
      setStep('input');
    }
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target.result);
        simulateProcessing('photo', { name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextSearch = (e) => {
    e.preventDefault();
    if (!textQuery.trim()) return;
    simulateProcessing('text', textQuery);
  };

  const handleConfirm = () => {
    onProductAdded({
      ...productDetails,
      available: true,
      id: Date.now()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#1A1A1A] rounded-[40px] w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="text-white" size={18} />
            </div>
            <div>
              <h2 className="font-black text-white text-lg tracking-tight">AI Menu Generator</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Powered by Vendorify AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white rounded-full hover:bg-white/10 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Mode Switcher */}
        {step === 'input' && (
          <div className="p-2 mx-6 mt-6 bg-black/20 rounded-full flex relative">
            <motion.div
              className="absolute top-1 bottom-1 bg-[#2A2A2A] rounded-full shadow-lg"
              initial={false}
              animate={{
                left: mode === 'photo' ? '4px' : '50%',
                width: 'calc(50% - 4px)'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => setMode('photo')}
              className={`flex-1 relative z-10 py-3 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${mode === 'photo' ? 'text-white' : 'text-white/40'}`}
            >
              <Camera size={16} /> Image
            </button>
            <button
              onClick={() => setMode('text')}
              className={`flex-1 relative z-10 py-3 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${mode === 'text' ? 'text-white' : 'text-white/40'}`}
            >
              <Type size={16} /> Text
            </button>
          </div>
        )}

        <div className="p-8 min-h-[400px]">
          <AnimatePresence mode="wait">

            {/* INPUT STEP */}
            {step === 'input' && mode === 'photo' && (
              <motion.div
                key="photo-input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col items-center justify-center h-full space-y-6 py-10"
              >
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-48 h-48 rounded-[32px] border-4 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[#CDF546] hover:bg-white/5 transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageIcon className="text-white/60 group-hover:text-[#CDF546]" size={32} />
                  </div>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Tap to Upload</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoCapture} />
                <p className="text-center text-white/60 max-w-xs text-sm">Upload a photo of your dish. Our AI will identify it and suggest details.</p>
              </motion.div>
            )}

            {step === 'input' && mode === 'text' && (
              <motion.div
                key="text-input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full py-6"
              >
                <form onSubmit={handleTextSearch} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-white/40 text-xs font-bold uppercase tracking-widest">Dish Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={textQuery}
                        onChange={(e) => setTextQuery(e.target.value)}
                        placeholder="e.g. Butter Chicken"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white placeholder:text-white/20 focus:outline-none focus:border-[#CDF546] transition-colors font-medium text-lg"
                        autoFocus
                      />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                    </div>
                  </div>
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                    <div className="flex gap-3">
                      <Sparkles className="text-indigo-400 shrink-0" size={20} />
                      <p className="text-indigo-200 text-xs leading-relaxed">
                        <strong className="block text-indigo-100 mb-1">AI Magic:</strong>
                        Type any dish name. We'll find a high-quality image, write a description, and estimate calories for you automatically.
                      </p>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!textQuery}
                    className="w-full bg-[#CDF546] disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 py-4 rounded-[20px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#CDF546]/20"
                  >
                    Generate Menu Card
                  </button>
                </form>
              </motion.div>
            )}

            {/* PROCESSING STEP */}
            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full py-12"
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full border-4 border-white/10 border-t-[#CDF546] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="text-[#CDF546] animate-pulse" size={32} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Analyzing...</h3>
                <p className="text-white/40 text-sm font-medium">Extracting ingredients & photos</p>
              </motion.div>
            )}

            {/* CONFIRM STEP */}
            {step === 'confirm' && productDetails && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
                  <div className="h-48 relative">
                    <img src={productDetails.image} alt={productDetails.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-black uppercase tracking-tight">{productDetails.name}</h3>
                      <p className="text-white/60 text-sm">{productDetails.category}</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Price</label>
                        <input
                          type="number"
                          value={productDetails.price}
                          onChange={(e) => setProductDetails({ ...productDetails, price: e.target.value })}
                          className="bg-transparent text-2xl font-black text-[#CDF546] outline-none w-32"
                        />
                      </div>
                      {productDetails.cal && (
                        <div className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-white/60">
                          {productDetails.cal}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Description</label>
                      <textarea
                        value={productDetails.description}
                        onChange={(e) => setProductDetails({ ...productDetails, description: e.target.value })}
                        className="w-full bg-transparent text-white/80 text-sm leading-relaxed outline-none resize-none h-20"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('input')}
                    className="flex-1 py-4 rounded-[24px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-colors bg-white/5"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-[2] py-4 rounded-[24px] font-black uppercase tracking-widest text-gray-900 bg-[#CDF546] hover:scale-105 transition-transform shadow-lg shadow-[#CDF546]/20 flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Approve
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AIProductListing;
