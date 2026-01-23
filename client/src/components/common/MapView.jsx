import React, { memo } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const MapView = memo(({ className = '', height = 'h-64' }) => {
  // Static coordinates for MG Road, Bengaluru (example)
  const lat = 12.9716;
  const lng = 77.5946;

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className={`relative bg-gray-100 rounded-xl overflow-hidden ${className} ${height}`}>
      <iframe
        src={osmUrl}
        className="absolute inset-0 w-full h-full border-0"
        title="Map view"
        loading="lazy"
      />
      <div className="absolute top-2 left-2 bg-white rounded-lg shadow-md px-2 py-1.5 flex items-center gap-1 text-xs text-gray-700">
        <MapPin size={12} />
        <span className="font-medium">MG Road, Bengaluru</span>
      </div>
      <div className="absolute bottom-2 right-2 bg-white rounded-lg shadow-md p-1.5">
        <Navigation size={16} className="text-indigo-600" />
      </div>
    </div>
  );
});

MapView.displayName = 'MapView';

export default MapView;
