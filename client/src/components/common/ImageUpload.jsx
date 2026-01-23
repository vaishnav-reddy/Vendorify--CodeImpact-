import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import { CONFIG, ERROR_MESSAGES } from '../../constants/config';

const ImageUpload = ({ 
  onImageUpload, 
  currentImage, 
  type = 'shop', // 'shop' or 'product'
  multiple = false,
  className = '',
  disabled = false 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = Array.from(files).filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('Please select only image files (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file sizes (5MB limit)
    const oversizedFiles = Array.from(files).filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      
      if (multiple) {
        Array.from(files).forEach(file => {
          formData.append('productImages', file);
        });
      } else {
        formData.append('shopPhoto', files[0]);
        
        // Create preview for single image
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(files[0]);
      }

      const result = await onImageUpload(formData);
      
      if (result.success) {
        if (!multiple) {
          setPreview(result.imageUrl);
        }
      } else {
        setError(result.message || 'Upload failed');
        setPreview(currentImage);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
      setPreview(currentImage);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearError = () => setError(null);

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      <div
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          transition-all duration-200 hover:border-green-400 hover:bg-green-50
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
          ${isUploading ? 'border-blue-300 bg-blue-50' : ''}
        `}
      >
        {preview && !multiple ? (
          <div className="relative">
            <img
              src={preview.startsWith('/uploads') ? `${CONFIG.API.BASE_URL.replace('/api', '')}${preview}` : preview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
        ) : (
          <div className="py-8">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-sm text-blue-600">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {multiple ? 'Upload product images' : 'Upload shop photo'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {multiple ? 'Max 3 files, 5MB each' : 'Max 5MB'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-100 border border-red-300 rounded-md flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
            <span className="text-sm text-green-600">Uploading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;