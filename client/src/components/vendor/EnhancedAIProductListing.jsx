import React, { useState, useRef } from 'react';
import { Camera, X, Check, Type, Search, Sparkles, Loader, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../utils/api';
import ImageUpload from '../common/ImageUpload';

const EnhancedAIProductListing = ({ onClose, onProductAdded }) => {
  const [mode, setMode] = useState('text'); // 'text' | 'manual'
  const [step, setStep] = useState('input'); // input, processing, confirm
  const [textQuery, setTextQuery] = useState('');
  const [productDetails, setProductDetails] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Manual form state
  const [manualProduct, setManualProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'food',
    image: '',
    isAvailable: true
  });

  const categories = [
    { value: 'food', label: 'Food' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'desserts', label: 'Desserts' }
  ];

  const handleAIGenerate = async () => {
    if (!textQuery.trim()) {
      setError('Please enter a product name');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setStep('processing');

    try {
      const response = await apiClient.post('/vendors/ai/generate', {
        query: textQuery.trim()
      });

      if (response && response.name) {
        setProductDetails({
          name: response.name,
          description: response.description || 'Delicious freshly prepared dish.',
          price: response.price || 199,
          category: response.category || 'Main Course',
          calories: response.calories || 'Unknown',
          ingredients: response.ingredients || ['Fresh Ingredients'],
          image: response.image || `https://loremflickr.com/500/500/food,${encodeURIComponent(textQuery)}/all`
        });
        setStep('confirm');
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      setError('Failed to generate product details. Please try again.');
      setStep('input');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmAIProduct = async () => {
    try {
      const productData = {
        name: productDetails.name,
        description: productDetails.description,
        price: productDetails.price,
        category: productDetails.category.toLowerCase(),
        image: productDetails.image,
        isAvailable: true
      };

      const response = await apiClient.post('/vendors/products', productData);
      
      if (response && response._id) {
        onProductAdded?.(response);
        onClose();
      } else {
        throw new Error('Failed to add product');
      }
    } catch (error) {
      console.error('Add product error:', error);
      setError('Failed to add product. Please try again.');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    if (!manualProduct.name || !manualProduct.price) {
      setError('Name and price are required');
      return;
    }

    try {
      const productData = {
        ...manualProduct,
        price: parseFloat(manualProduct.price)
      };

      const response = await apiClient.post('/vendors/products', productData);
      
      if (response && response._id) {
        onProductAdded?.(response);
        onClose();
      } else {
        throw new Error('Failed to add product');
      }
    } catch (error) {
      console.error('Add manual product error:', error);
      setError('Failed to add product. Please try again.');
    }
  };

  const handleImageUpload = async (formData) => {
    try {
      const response = await apiClient.post('/vendors/upload/product-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.success && response.imageUrls && response.imageUrls.length > 0) {
        setManualProduct(prev => ({
          ...prev,
          image: response.imageUrls[0]
        }));
        return { success: true, imageUrl: response.imageUrls[0] };
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      return { success: false, message: error.message || 'Upload failed' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Product</h2>
              <p className="text-sm text-gray-500">AI-powered or manual entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selection */}
        <div className="p-6 border-b">
          <div className="flex space-x-4">
            <button
              onClick={() => setMode('text')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                mode === 'text'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Sparkles className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">AI ADD</div>
              <div className="text-sm text-gray-500">Auto-generate details</div>
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                mode === 'manual'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Plus className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">MANUAL ADD</div>
              <div className="text-sm text-gray-500">Enter details manually</div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {mode === 'text' && (
            <AnimatePresence mode="wait">
              {step === 'input' && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What would you like to add?
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={textQuery}
                        onChange={(e) => setTextQuery(e.target.value)}
                        placeholder="e.g., Butter Chicken, Masala Dosa, Cold Coffee..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleAIGenerate()}
                      />
                      <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <button
                    onClick={handleAIGenerate}
                    disabled={!textQuery.trim() || isGenerating}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Generate with AI</span>
                  </button>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Loader className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    AI is generating product details...
                  </h3>
                  <p className="text-gray-500">This may take a few seconds</p>
                </motion.div>
              )}

              {step === 'confirm' && productDetails && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex space-x-4">
                      <img
                        src={productDetails.image}
                        alt={productDetails.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {productDetails.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {productDetails.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="font-medium text-green-600">
                            ₹{productDetails.price}
                          </span>
                          <span className="text-gray-500">
                            {productDetails.category}
                          </span>
                          {productDetails.calories && (
                            <span className="text-gray-500">
                              {productDetails.calories}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setStep('input')}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={handleConfirmAIProduct}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Add to Menu</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {mode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={manualProduct.name}
                  onChange={(e) => setManualProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Butter Chicken"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={manualProduct.description}
                  onChange={(e) => setManualProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe your product..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={manualProduct.price}
                    onChange={(e) => setManualProduct(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="199"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={manualProduct.category}
                    onChange={(e) => setManualProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  currentImage={manualProduct.image}
                  type="product"
                  multiple={false}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={manualProduct.isAvailable}
                  onChange={(e) => setManualProduct(prev => ({ ...prev, isAvailable: e.target.checked }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
                  Available for orders
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedAIProductListing;