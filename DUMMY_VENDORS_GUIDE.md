# Dummy Vendors Guide

This guide explains how to add and manage dummy vendors for testing the customer dashboard map functionality.

## 🚀 Quick Start

### Method 1: Using Customer Dashboard (Recommended)
1. **Login as a customer** or visit the customer dashboard
2. **Click "Add Test Data"** button in the vendors section
3. **Click "Refresh"** to see the new vendors on the map
4. **Use "Clear Test Data"** to remove all test vendors

### Method 2: Using Server Script
```bash
# Navigate to server directory
cd server

# Run the test vendors script
node scripts/addTestVendors.js
```

### Method 3: Using API Endpoints
```bash
# Add test vendors
curl -X POST http://localhost:5001/api/test/add-test-vendors

# Clear test vendors
curl -X DELETE http://localhost:5001/api/test/clear-test-vendors
```

## 📍 Test Vendors Included

The dummy data includes **12 diverse vendors** across different categories:

### 🍛 Food & Street Food
- **Spice Junction** - Authentic Indian spices and street food
- **Mumbai Chaat Corner** - Famous Mumbai street food (Pani Puri, Bhel Puri)
- **Dosa Express** - South Indian delicacies (Dosas, Idli, Sambhar)

### 🍎 Fruits & Vegetables
- **Fresh Fruit Paradise** - Fresh seasonal fruits and organic produce
- **Green Veggie Hub** - Farm fresh vegetables and leafy greens

### ☕ Beverages
- **Coffee Express** - Premium coffee, tea, and fresh juices
- **Lassi Junction** - Traditional lassi, milkshakes, and cold drinks

### 🌸 Flowers & Services
- **Bloom & Blossom** - Fresh flowers and decorative arrangements

### 🛒 Grocery
- **Daily Essentials** - Groceries, household items, and daily necessities

### 🚚 Roaming Vendors (Mobile)
- **Mobile Kulfi Cart** - Traditional kulfi and ice cream on wheels
- **Fresh Juice Trolley** - Fresh fruit juices and smoothies on the go

## 🗺️ Map Features Demonstrated

### Location Distribution
- All vendors are positioned around **Delhi's Connaught Place area**
- Coordinates range from `28.6109` to `28.6189` (latitude)
- Spread across different landmarks (Khan Market, Janpath, Karol Bagh, etc.)

### Vendor Status Variety
- ✅ **Online/Offline** vendors (mix of both)
- 🛡️ **Verified/Unverified** vendors (mix of both)
- ⭐ **Different ratings** (4.0 to 4.8 stars)
- 📊 **Various review counts** (67 to 234 reviews)

### Special Features
- 🚚 **Roaming vendors** with live tracking simulation
- 📍 **Current location** and **next stops** for mobile vendors
- 🏷️ **Category filtering** (food, beverages, fruits, etc.)
- 📱 **High-quality images** from Unsplash

## 🎯 Testing Scenarios

### Map Functionality
1. **Zoom and Pan** - Test map navigation with multiple vendors
2. **Vendor Clustering** - See how vendors group when zoomed out
3. **Popup Information** - Click vendors to see details
4. **Category Filtering** - Filter by food, beverages, fruits, etc.

### Interactive Features
1. **Vendor Selection** - Click to select and highlight vendors
2. **Distance Calculation** - See distance from user location
3. **Status Indicators** - Online/offline and verified badges
4. **Roaming Tracking** - Special markers for mobile vendors

### Search & Filter
1. **Search by Name** - Search for "Coffee", "Fruit", "Chaat", etc.
2. **Category Filter** - Filter by specific categories
3. **Sort Options** - Sort by distance, rating, or name
4. **Radius Filter** - Adjust search radius (default 2km)

## 🔧 Customization

### Adding More Vendors
Edit `server/routes/testRoutes.js` and add new vendor objects to the `testVendors` array:

```javascript
{
  shopName: 'Your Vendor Name',
  category: 'food', // food, beverages, fruits, vegetables, flowers, grocery, services
  description: 'Vendor description',
  location: {
    type: 'Point',
    coordinates: [longitude, latitude] // [lng, lat] format
  },
  address: 'Full address',
  phone: '+91-XXXXXXXXXX',
  isOnline: true,
  isVerified: true,
  rating: 4.5,
  totalReviews: 100,
  image: 'https://images.unsplash.com/photo-xxx',
  shopId: 'UNIQUE-SHOP-ID'
}
```

### Changing Locations
- Update the `coordinates` array with `[longitude, latitude]`
- Ensure coordinates are in **GeoJSON format** (lng, lat)
- Use tools like [LatLong.net](https://www.latlong.net/) to get coordinates

### Adding Roaming Vendors
Add a `schedule` object for mobile vendors:

```javascript
schedule: {
  isRoaming: true,
  currentStop: 'Current location description',
  nextStops: [
    { location: 'Next stop 1', time: '2:00 PM' },
    { location: 'Next stop 2', time: '4:00 PM' }
  ]
}
```

## 🐛 Troubleshooting

### Vendors Not Showing on Map
1. **Check coordinates format** - Must be `[longitude, latitude]`
2. **Verify location permissions** - Browser must allow location access
3. **Check radius** - Vendors might be outside the search radius
4. **Refresh data** - Click "Refresh" button after adding vendors

### API Errors
1. **Server running** - Ensure server is running on port 5001
2. **Database connection** - Check MongoDB connection
3. **CORS issues** - Verify CORS is enabled for localhost:3000

### Map Not Loading
1. **Internet connection** - Map tiles require internet
2. **Leaflet dependencies** - Check if Leaflet CSS/JS are loaded
3. **Console errors** - Check browser console for JavaScript errors

## 📊 Data Structure

### Vendor Model Fields
- `shopName` - Display name of the vendor
- `category` - Category for filtering (food, beverages, etc.)
- `description` - Brief description of offerings
- `location.coordinates` - GeoJSON coordinates [lng, lat]
- `address` - Human-readable address
- `phone` - Contact number
- `isOnline` - Current availability status
- `isVerified` - Verification badge status
- `rating` - Average rating (1-5 stars)
- `totalReviews` - Number of reviews
- `image` - Profile image URL
- `shopId` - Unique identifier

### Location Format
```javascript
location: {
  type: 'Point',
  coordinates: [longitude, latitude] // GeoJSON format
}
```

## 🎨 Visual Features

### Map Markers
- 📍 **Standard vendors** - Regular map pins
- 🚚 **Roaming vendors** - Special mobile icons
- ✅ **Online status** - Green indicators
- 🛡️ **Verified badge** - Blue verification icons

### Vendor Cards
- 🖼️ **High-quality images** - Unsplash photos
- ⭐ **Star ratings** - Visual rating display
- 📏 **Distance indicators** - Distance from user
- 🏷️ **Category badges** - Color-coded categories

This comprehensive dummy data setup allows you to test all map and vendor discovery features effectively!