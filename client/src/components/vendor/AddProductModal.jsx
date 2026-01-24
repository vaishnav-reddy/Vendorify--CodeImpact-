import React, { useState } from 'react';
import { X, Upload, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddProductModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'food',
    image: '',
    ingredients: []
  });
  const [newIngredient, setNewIngredient] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      price: parseFloat(formData.price),
      id: Date.now().toString()
    });
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'food',
      image: '',
      ingredients: []
    });
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient.trim()]
      }));
      setNewIngredient('');
    }
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Add New Product</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A6950]"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A6950]"
                rows="3"
                placeholder="Describe your product"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price (₹)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A6950]"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A6950]"
              >
                <option value="food">Food</option>
                <option value="beverages">Beverages</option>
                <option value="snacks">Snacks</option>
                <option value="desserts">Desserts</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Product Image</label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setFormData(prev => ({ ...prev, image: e.target.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A6950]"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Upload an image from your device (JPG, PNG, GIF)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ingredients</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-[#1A6950]"
                  placeholder="Add ingredient"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                />
                <button
                  type="button"
                  onClick={addIngredient}
                  className="px-3 py-2 bg-[#1A6950] text-white rounded-lg hover:bg-[#145240]"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-[#1A6950] text-white rounded-lg hover:bg-[#145240]"
              >
                Add Product
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddProductModal;