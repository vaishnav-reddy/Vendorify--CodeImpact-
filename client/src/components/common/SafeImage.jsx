import React, { useState, useEffect } from 'react';
import { createImageSources, handleImageError } from '../../utils/imageUtils';

const SafeImage = ({ 
  src, 
  alt, 
  name, 
  category = 'general',
  className = '',
  fallbackText,
  showPlaceholder = true,
  ...props 
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Create fallback sources
  const imageSources = createImageSources(src, name || alt, category);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = (event) => {
    const img = event.target;
    const currentIndex = imageSources.indexOf(img.src);
    const nextIndex = currentIndex + 1;

    if (nextIndex < imageSources.length) {
      // Try next fallback
      console.log(`Image failed: ${img.src}, trying fallback ${nextIndex + 1}/${imageSources.length}`);
      setCurrentSrc(imageSources[nextIndex]);
    } else {
      // All fallbacks failed
      console.log('All image sources failed');
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  if (hasError && showPlaceholder) {
    return (
      <div 
        className={`bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${className}`}
        {...props}
      >
        <div className="text-center text-gray-600 p-4">
          <div className="text-2xl mb-2">
            {category === 'vegetables' ? '🥬' :
             category === 'fruits' ? '🍎' :
             category === 'food' ? '🍛' :
             category === 'beverages' ? '☕' :
             category === 'flowers' ? '🌸' :
             category === 'services' ? '🔧' : '🏪'}
          </div>
          <div className="text-sm font-medium">
            {fallbackText || name || alt || 'Image'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
      
      {/* Loading placeholder */}
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default SafeImage;