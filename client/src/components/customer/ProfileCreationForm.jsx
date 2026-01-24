import React, { useState } from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';

const ProfileCreationForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    preferences: {
      dietary: [],
      cuisines: []
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto'];
  const cuisineOptions = ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Continental'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [type]: prev.preferences[type].includes(value)
          ? prev.preferences[type].filter(item => item !== value)
          : [...prev.preferences[type], value]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Profile creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            <User size={16} className="inline mr-2" />
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1A6950] focus:border-[#1A6950] outline-none"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            <Mail size={16} className="inline mr-2" />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1A6950] focus:border-[#1A6950] outline-none"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            <Phone size={16} className="inline mr-2" />
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1A6950] focus:border-[#1A6950] outline-none"
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            <MapPin size={16} className="inline mr-2" />
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1A6950] focus:border-[#1A6950] outline-none resize-none"
            placeholder="Enter your address"
          />
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Dietary Preferences (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => handlePreferenceChange('dietary', option)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  formData.preferences.dietary.includes(option)
                    ? 'bg-[#1A6950] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Favorite Cuisines (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {cuisineOptions.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => handlePreferenceChange('cuisines', option)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  formData.preferences.cuisines.includes(option)
                    ? 'bg-[#1A6950] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border border-gray-300 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
        >
          Skip for Now
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.name || !formData.email}
          className="flex-1 py-3 bg-[#1A6950] text-white rounded-2xl font-bold hover:bg-[#145240] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating...
            </div>
          ) : (
            'Create Profile'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileCreationForm;