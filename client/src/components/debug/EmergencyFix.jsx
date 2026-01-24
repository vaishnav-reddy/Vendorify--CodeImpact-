import React from 'react';
import { clearAllStorage, clearAuthStorage } from '../../utils/clearStorage';

const EmergencyFix = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 bg-red-500 text-white p-4 rounded-lg text-sm z-50">
      <h4 className="font-bold mb-2">🚨 Emergency Fix</h4>
      <p className="mb-3 text-xs">If the app is stuck loading:</p>
      <div className="space-y-2">
        <button
          onClick={clearAuthStorage}
          className="block w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-xs font-bold"
        >
          Clear Auth & Reload
        </button>
        <button
          onClick={clearAllStorage}
          className="block w-full bg-red-700 hover:bg-red-800 px-3 py-2 rounded text-xs font-bold"
        >
          Clear All Storage & Reload
        </button>
      </div>
    </div>
  );
};

export default EmergencyFix;