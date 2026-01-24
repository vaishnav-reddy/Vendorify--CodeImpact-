import React, { useState, useEffect } from 'react';
import { X, Camera, MapPin, Clock, Phone, Mail, Loader, Upload, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../utils/api';
import { toast } from 'react-toastify';

const ShopDetailsModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    category: 'food',
    operatingHours: '10:00 AM - 9:00 PM',
    services: []
  });

  const [shopImage, setShopImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      console.log('🔄 ShopDetailsModal received initialData:', initialData);
      
      // Populate form data
      setFormData({
        shopName: initialData.shopName || '',
        ownerName: initialData.ownerName || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
        category: initialData.category || 'food',
        operatingHours: initialData.schedule?.operatingHours || initialData.operatingHours || '10:00 AM - 9:00 PM',
        services: initialData.services || []
      });
      
      // Set image preview if image exists
      if (initialData.image || initialData.shopImage) {
        const imageUrl = initialData.image || initialData.shopImage;
        const fullImageUrl = apiClient.getImageUrl(imageUrl);
          
        console.log('🖼️ Loading existing image in modal:', { imageUrl, fullImageUrl });
        
        setImagePreview(fullImageUrl);
        setShopImage(imageUrl);
      } else {
        console.log('📷 No existing image found in initialData');
        // Clear any previous image state
        setImagePreview(null);
        setShopImage(null);
      }
    }
  }, [initialData]);

  // Auto-detect location on modal open - FIXED: Only update location, preserve other data
  useEffect(() => {
    if (isOpen && (!formData.address || formData.address === 'Location not set')) {
      detectCurrentLocation();
    }
  }, [isOpen, formData.address]); // ADDED: Dependency on formData.address

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setIsDetectingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        
        try {
          // Get readable location name first
          const readableAddress = await apiClient.getReadableLocation(latitude, longitude);
          console.log('🌍 Readable address:', readableAddress);
          
          // Update the form with readable address immediately
          setFormData(prev => ({
            ...prev,
            address: readableAddress
          }));
          
          // Then update backend location
          try {
            const response = await apiClient.updateLiveLocation(latitude, longitude);
            if (response.success && response.vendor.address) {
              // If backend returns a better address, use it
              setFormData(prev => ({
                ...prev,
                address: response.vendor.address
              }));
            }
            toast.success('Location detected and updated!');
          } catch (backendError) {
            console.warn('Backend location update failed, using client-side geocoding');
            toast.success('Location detected!');
          }
        } catch (error) {
          console.error('Failed to get readable location:', error);
          // Final fallback to coordinates
          setFormData(prev => ({
            ...prev,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
          toast.warning('Location detected but address lookup failed');
        }
        
        setIsDetectingLocation(false);
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        toast.error(errorMessage);
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('shopPhoto', file);
      
      console.log('🔄 Uploading file:', file.name, file.size);
      
      const response = await apiClient.uploadShopPhoto(formData);
      
      console.log('📤 Upload response:', response);
      
      if (response.success) {
        // Use the image URL from server response
        const imageUrl = response.imageUrl;
        const fullImageUrl = response.fullImageUrl || apiClient.getImageUrl(imageUrl);
          
        console.log('🖼️ Setting image preview:', fullImageUrl);
        
        // Set the image preview immediately
        setImagePreview(fullImageUrl);
        setShopImage(imageUrl); // This will be saved when form is submitted
        
        toast.success('Image uploaded! Click "Save Changes" to save your profile.');
      } else {
        console.error('❌ Upload failed:', response);
        toast.error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraCapture = async () => {
    try {
      setIsUploading(true);
      toast.info('Opening camera...');
      
      const photoBlob = await apiClient.capturePhotoFromCamera();
      
      // Create a file from the blob
      const file = new File([photoBlob], 'camera-photo.jpg', { type: 'image/jpeg' });
      
      // Upload the captured photo
      await handleImageUpload(file);
    } catch (error) {
      console.error('Camera capture failed:', error);
      toast.error(error.message || 'Failed to capture photo from camera');
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Prepare update data with all form fields
      const updateData = {
        ...formData,
        schedule: {
          operatingHours: formData.operatingHours
        }
      };

      // IMPORTANT: Include image if uploaded
      if (shopImage) {
        updateData.image = shopImage;
        console.log('💾 Including image in profile update:', shopImage);
      }

      // Include coordinates if available
      if (currentLocation) {
        updateData.coordinates = [currentLocation.longitude, currentLocation.latitude];
      }

      console.log('📝 Updating profile with data:', updateData);

      const response = await apiClient.updateVendorProfile(updateData);
      
      console.log('📤 Profile update response:', response);
      
      if (response.success) {
        toast.success('Profile updated successfully!');
        
        // Pass the updated data back to parent component
        const updatedVendorData = {
          ...response.vendor,
          image: response.vendor.image || shopImage // Ensure image is included
        };
        
        console.log('✅ Calling onSave with:', updatedVendorData);
        onSave(updatedVendorData);
        onClose();
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const availableServices = [
    'Home Delivery',
    'Takeaway',
    'Dine In',
    'Online Payment',
    'Cash on Delivery',
    'Bulk Orders'
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Shop Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shop Image Upload */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg bg-white">
                  {imagePreview && imagePreview !== '' ? (
                    <>
                      <img
                        key={imagePreview}
                        src={imagePreview}
                        alt="Shop Profile"
                        className="w-full h-full object-cover"
                        onLoad={() => {
                          console.log('✅ Profile modal image loaded successfully');
                          console.log('Image URL:', imagePreview);
                        }}
                        onError={(e) => {
                          console.error('❌ Profile modal image failed to load');
                          console.error('Failed URL:', e.target.src);
                          console.error('imagePreview value:', imagePreview);
                          // Hide the broken image and show placeholder
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50" style={{ display: 'none' }}>
                        <div className="w-12 h-12 bg-gray-200 rounded-full mb-2 flex items-center justify-center">
                          <Camera size={20} className="text-gray-400" />
                        </div>
                        <div className="text-xs font-medium">Add Photo</div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                      <div className="w-12 h-12 bg-gray-200 rounded-full mb-2 flex items-center justify-center">
                        <Camera size={20} className="text-gray-400" />
                      </div>
                      <div className="text-xs font-medium">Add Photo</div>
                    </div>
                  )}
                </div>
                
                {/* Camera and Upload Options */}
                <div className="absolute bottom-0 right-0 flex gap-1">
                  {/* Camera Capture Button */}
                  <button
                    type="button"
                    onClick={handleCameraCapture}
                    disabled={isUploading}
                    className="bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors text-white shadow-lg"
                    title="Take photo with camera"
                  >
                    {isUploading ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <Camera size={16} />
                    )}
                  </button>
                  
                  {/* File Upload Button */}
                  <label className="bg-green-600 p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors shadow-lg">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                      className="hidden"
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <Loader size={16} className="animate-spin text-white" />
                    ) : (
                      <Upload size={16} className="text-white" />
                    )}
                  </label>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Take a photo with camera or upload from gallery (Max 5MB)
              </p>
              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-400 mt-1 space-y-1">
                  <p>Debug: {imagePreview ? `Image: ${imagePreview}` : 'No image preview'}</p>
                  <p>shopImage: {shopImage || 'No shopImage'}</p>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Shop Name *</label>
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A6950]"
                  placeholder="Enter shop name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Owner Name *</label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A6950]"
                  placeholder="Enter owner name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Phone size={16} className="inline mr-1" />
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A6950]"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Mail size={16} className="inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A6950]"
                  placeholder="shop@example.com"
                />
              </div>
            </div>

            {/* Location Section */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <MapPin size={16} className="inline mr-1" />
                Shop Location *
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#1A6950]"
                    rows="2"
                    placeholder="Enter shop address"
                  />
                  <button
                    type="button"
                    onClick={detectCurrentLocation}
                    disabled={isDetectingLocation}
                    className="px-4 py-2 bg-[#1A6950] text-white rounded-lg hover:bg-[#145240] disabled:opacity-50 flex items-center gap-2"
                  >
                    {isDetectingLocation ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <MapPin size={16} />
                    )}
                    {isDetectingLocation ? 'Detecting...' : 'Live Location'}
                  </button>
                </div>
                
                {currentLocation && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle size={16} />
                    <span>Live location detected and updated</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A6950]"
                >
                  <option value="food">Food</option>
                  <option value="beverages">Beverages</option>
                  <option value="fruits">Fruits</option>
                  <option value="grocery">Grocery</option>
                  <option value="fashion">Fashion</option>
                  <option value="electronics">Electronics</option>
                  <option value="services">Services</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Clock size={16} className="inline mr-1" />
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={formData.operatingHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, operatingHours: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1A6950]"
                  placeholder="10:00 AM - 9:00 PM"
                />
              </div>
            </div>

            {/* Services */}
            <div>
              <label className="block text-sm font-medium mb-2">Services Offered</label>
              <div className="grid grid-cols-2 gap-2">
                {availableServices.map((service) => (
                  <label key={service} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                      className="rounded border-gray-300 text-[#1A6950] focus:ring-[#1A6950]"
                    />
                    <span className="text-sm">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 bg-[#1A6950] text-white rounded-lg hover:bg-[#145240] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShopDetailsModal;