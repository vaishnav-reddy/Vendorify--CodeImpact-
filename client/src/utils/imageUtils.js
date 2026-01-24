/**
 * Utility functions for handling images with fallbacks
 */

// Generate a placeholder image URL with custom text and colors
export const generatePlaceholder = (text, width = 400, height = 400, bgColor = '1A6950', textColor = 'ffffff') => {
  return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
};

// Generate avatar-style image for vendors
export const generateVendorAvatar = (name, size = 400) => {
  const colors = ['1A6950', 'F56013', '84A02A', '8D5824', 'C2185B', '388E3C', '455A64', 'FFB300'];
  const colorIndex = name ? name.length % colors.length : 0;
  const bgColor = colors[colorIndex];
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=ffffff&size=${size}&bold=true`;
};

// Handle image error with multiple fallback options
export const handleImageError = (event, fallbacks = []) => {
  const img = event.target;
  const currentSrc = img.src;
  
  // Find the next fallback that hasn't been tried yet
  const nextFallback = fallbacks.find(fallback => fallback !== currentSrc);
  
  if (nextFallback) {
    console.log(`Image failed: ${currentSrc}, trying fallback: ${nextFallback}`);
    img.src = nextFallback;
  } else {
    // All fallbacks failed, hide the image and show placeholder
    console.log('All image fallbacks failed');
    img.style.display = 'none';
    
    // Try to show a placeholder div if it exists
    const placeholder = img.parentElement.querySelector('.image-placeholder');
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  }
};

// Create reliable image sources with fallbacks
export const createImageSources = (primaryUrl, name, category = 'general') => {
  const fallbacks = [];
  
  // Add primary URL if provided
  if (primaryUrl) {
    fallbacks.push(primaryUrl);
  }
  
  // Add category-specific fallbacks
  const categoryImages = {
    vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop',
    fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop',
    food: 'https://images.unsplash.com/photo-1554978991-33ef7f31d658?w=400&h=400&fit=crop',
    beverages: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
    flowers: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop',
    services: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&h=400&fit=crop',
    general: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'
  };
  
  // Add category fallback
  if (categoryImages[category]) {
    fallbacks.push(categoryImages[category]);
  }
  
  // Add avatar fallback
  if (name) {
    fallbacks.push(generateVendorAvatar(name));
  }
  
  // Add generic placeholder
  fallbacks.push(generatePlaceholder(name || category || 'Image', 400, 400));
  
  return fallbacks;
};

// Preload images to check if they're available
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(src);
    img.src = src;
  });
};

// Get the best available image from a list of sources
export const getBestImage = async (sources) => {
  for (const src of sources) {
    try {
      await preloadImage(src);
      return src; // Return the first working image
    } catch (error) {
      console.log(`Image not available: ${src}`);
      continue;
    }
  }
  
  // If no images work, return a reliable placeholder
  return generatePlaceholder('No Image', 400, 400, 'cccccc', '666666');
};