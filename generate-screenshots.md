# 📸 Screenshot Generation Guide

This guide helps you capture and add real screenshots to the README.

## 🎯 Required Screenshots

### 1. Landing Page (`landing-page.png`)
- **URL**: `http://localhost:3000`
- **Size**: 1200x800px
- **Focus**: Hero section with bilingual text and action buttons
- **Replace**: `https://via.placeholder.com/800x500/FDF9DC/1A6950?text=Landing+Page+Screenshot`

### 2. Customer Dashboard (`customer-dashboard.png`)
- **URL**: `http://localhost:3000/customer`
- **Size**: 1200x800px
- **Focus**: Map view with vendor markers and sidebar
- **Replace**: `https://via.placeholder.com/800x500/FFFFFF/1A6950?text=Customer+Dashboard+Screenshot`

### 3. Vendor Dashboard (`vendor-dashboard.png`)
- **URL**: `http://localhost:3000/vendor`
- **Size**: 1200x800px
- **Focus**: Analytics, orders, and management interface
- **Replace**: `https://via.placeholder.com/800x500/1A6950/FFFFFF?text=Vendor+Dashboard+Screenshot`

### 4. Mobile Views (3 screenshots)
- **Size**: 375x812px (iPhone X dimensions)
- **Views**: 
  - Mobile landing page
  - Mobile customer dashboard
  - Mobile vendor dashboard
- **Replace**: The three mobile placeholder images

### 5. Additional Screenshots (Optional)
- Login pages (customer/vendor)
- Vendor profile page
- Order tracking page
- Map with vendor details popup

## 🛠️ How to Capture Screenshots

### Method 1: Browser Developer Tools
1. Open Chrome/Firefox Developer Tools (F12)
2. Click device toolbar icon (mobile icon)
3. Set custom dimensions (1200x800 for desktop, 375x812 for mobile)
4. Navigate to the page
5. Right-click → "Capture screenshot" or use browser screenshot extension

### Method 2: Screenshot Tools
- **Windows**: Snipping Tool, Greenshot
- **Mac**: Screenshot (Cmd+Shift+4)
- **Linux**: GNOME Screenshot, Flameshot
- **Browser Extensions**: Awesome Screenshot, Full Page Screen Capture

### Method 3: Automated (Advanced)
```bash
# Install Puppeteer for automated screenshots
npm install puppeteer

# Create screenshot script
node scripts/generate-screenshots.js
```

## 📁 File Organization

Create a `screenshots/` folder in the project root:
```
vendorify/
├── screenshots/
│   ├── landing-page.png
│   ├── customer-dashboard.png
│   ├── vendor-dashboard.png
│   ├── mobile-view-1.png
│   ├── mobile-view-2.png
│   └── mobile-view-3.png
└── README.md
```

## 🔄 Updating README

After capturing screenshots, update the README.md file:

```markdown
### 🏠 Landing Page
![Landing Page](screenshots/landing-page.png)
*Modern landing page with bilingual support and clear call-to-actions*

### 🛍️ Customer Dashboard
![Customer Dashboard](screenshots/customer-dashboard.png)
*Interactive map view with nearby vendors and real-time locations*

### 🏪 Vendor Dashboard
![Vendor Dashboard](screenshots/vendor-dashboard.png)
*Comprehensive vendor management with analytics and order tracking*

### 📱 Mobile Experience
<div align="center">
<img src="screenshots/mobile-view-1.png" width="200" alt="Mobile Landing">
<img src="screenshots/mobile-view-2.png" width="200" alt="Mobile Customer">
<img src="screenshots/mobile-view-3.png" width="200" alt="Mobile Vendor">
</div>
```

## 🎨 Screenshot Best Practices

1. **Clean Data**: Use test accounts with realistic data
2. **Good Lighting**: Ensure UI elements are clearly visible
3. **Consistent Sizing**: Maintain aspect ratios
4. **No Personal Info**: Avoid real personal information
5. **High Quality**: Use high-resolution images
6. **Compressed**: Optimize file sizes for web

## 🚀 Quick Setup for Screenshots

1. Start both servers:
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2  
cd client && npm start
```

2. Login with test accounts:
- **Customer**: `customer@test.com` / `customer123`
- **Vendor**: `vendor@test.com` / `vendor123`

3. Navigate to different pages and capture screenshots

4. Replace placeholder URLs in README.md with actual screenshot paths

## 📝 Notes

- Screenshots should showcase the actual functionality
- Include both light and dark mode if available
- Show real data from the test database
- Capture different states (loading, success, error) if relevant
- Consider creating a GIF for interactive features