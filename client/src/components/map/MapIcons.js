/**
 * Custom map icons and styling for Leaflet map
 */

// Import Leaflet for proper icon creation
let L;

// Dynamically import Leaflet
const getLeaflet = async () => {
  if (!L) {
    L = await import('leaflet');
  }
  return L;
};

// Custom SVG icons as data URLs for better performance and theme consistency
export const createCustomIcon = async (type, isActive = false) => {
  const leaflet = await getLeaflet();
  
  const icons = {
    user: {
      svg: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#CDF546" stroke="#1A6950" stroke-width="3"/>
        <circle cx="16" cy="16" r="6" fill="#1A6950"/>
        <circle cx="16" cy="16" r="3" fill="#CDF546"/>
      </svg>`,
      size: [32, 32],
      anchor: [16, 16]
    },
    vendor: {
      svg: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36S28 24.5 28 14C28 6.268 21.732 0 14 0Z" fill="${isActive ? '#1A6950' : '#ffffff'}" stroke="#1A6950" stroke-width="2"/>
        <circle cx="14" cy="14" r="8" fill="${isActive ? '#CDF546' : '#1A6950'}"/>
        <path d="M10 12H18M10 16H18" stroke="${isActive ? '#1A6950' : '#ffffff'}" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
      size: [28, 36],
      anchor: [14, 36]
    },
    restaurant: {
      svg: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36S28 24.5 28 14C28 6.268 21.732 0 14 0Z" fill="${isActive ? '#ef4444' : '#ffffff'}" stroke="#ef4444" stroke-width="2"/>
        <circle cx="14" cy="14" r="8" fill="${isActive ? '#ffffff' : '#ef4444'}"/>
        <path d="M10 10V18M12 10V18M16 10C16 10 18 10 18 12V18" stroke="${isActive ? '#ef4444' : '#ffffff'}" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`,
      size: [28, 36],
      anchor: [14, 36]
    },
    grocery: {
      svg: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36S28 24.5 28 14C28 6.268 21.732 0 14 0Z" fill="${isActive ? '#10b981' : '#ffffff'}" stroke="#10b981" stroke-width="2"/>
        <circle cx="14" cy="14" r="8" fill="${isActive ? '#ffffff' : '#10b981'}"/>
        <path d="M10 12H18L17 18H11L10 12Z" stroke="${isActive ? '#10b981' : '#ffffff'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="20" r="1" fill="${isActive ? '#10b981' : '#ffffff'}"/>
        <circle cx="16" cy="20" r="1" fill="${isActive ? '#10b981' : '#ffffff'}"/>
      </svg>`,
      size: [28, 36],
      anchor: [14, 36]
    },
    roaming: {
      svg: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36S28 24.5 28 14C28 6.268 21.732 0 14 0Z" fill="${isActive ? '#3b82f6' : '#ffffff'}" stroke="#3b82f6" stroke-width="2"/>
        <circle cx="14" cy="14" r="8" fill="${isActive ? '#ffffff' : '#3b82f6'}"/>
        <path d="M10 14L14 10L18 14M14 10V18" stroke="${isActive ? '#3b82f6' : '#ffffff'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      size: [28, 36],
      anchor: [14, 36]
    }
  };

  const icon = icons[type] || icons.vendor;
  
  // Create proper Leaflet icon
  return leaflet.default.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(icon.svg)}`,
    iconSize: icon.size,
    iconAnchor: icon.anchor,
    popupAnchor: [0, -icon.anchor[1]]
  });
};

// Synchronous version for fallback
export const createSimpleIcon = (type, isActive = false) => {
  // Return a simple colored circle as fallback
  const colors = {
    user: '#CDF546',
    vendor: '#1A6950',
    restaurant: '#ef4444',
    grocery: '#10b981',
    roaming: '#3b82f6'
  };
  
  const color = colors[type] || colors.vendor;
  const size = type === 'user' ? 16 : 12;
  
  const svg = `<svg width="${size * 2}" height="${size * 2}" viewBox="0 0 ${size * 2} ${size * 2}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${size}" cy="${size}" r="${size - 2}" fill="${color}" stroke="#ffffff" stroke-width="2"/>
  </svg>`;
  
  return {
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
    popupAnchor: [0, -size]
  };
};

// Get icon type based on vendor category
export const getVendorIconType = (vendor) => {
  if (vendor.schedule?.isRoaming) return 'roaming';
  
  const categoryMap = {
    food: 'restaurant',
    beverages: 'restaurant',
    fruits: 'grocery',
    grocery: 'grocery',
    fashion: 'vendor',
    electronics: 'vendor',
    services: 'vendor',
    other: 'vendor'
  };
  
  return categoryMap[vendor.category] || 'vendor';
};

// Custom map styles for different themes
export const getMapTileLayer = (theme = 'light') => {
  const styles = {
    light: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }
  };
  
  return styles[theme] || styles.light;
};