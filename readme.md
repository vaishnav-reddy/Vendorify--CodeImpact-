#  Vendorify - Street Vendor Marketplace

<div align="center">

[Vendorify Logo](image-11.png)

**गली गली के ठेले वाले आपको यहाँ मिलेंगे**  
*Desi Products, World-Class Quality, Street Prices*

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5+-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.3-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)

[ Live Demo](#) • [Documentation](#) • [ Report Bug](#) • [Request Feature](#)

</div>

---

##  Table of Contents

- [ Features](#-features)
- [ Demo & Screenshots](#-demo--screenshots)
- [ Tech Stack](#️-tech-stack)
- [ Quick Start](#-quick-start)
- [ Project Structure](#-project-structure)
- [ API Documentation](#-api-documentation)
- [ UI Components](#-ui-components)
- [ Authentication](#-authentication)
- [ Maps & Location](#️-maps--location)
- [ Real-time Features](#-real-time-features)
- [ Mobile Responsive](#-mobile-responsive)
- [ Testing](#-testing)
- [ Deployment](#-deployment)
- [ Contributing](#-contributing)
- [ License](#-license)

---

##  Features

###  **Multi-Role Platform**
- ** Customer Portal** - Browse, search, and order from local vendors
- ** Vendor Dashboard** - Manage shop, products, orders, and analytics
- ** Admin Panel** - Platform management and vendor verification

###  **Location-Based Services**
- ** Real-time Vendor Tracking** - Live location updates for roaming vendors
- ** Proximity Search** - Find vendors within specified radius
- ** Interactive Maps** - Leaflet-powered maps with custom markers
- ** Geolocation Integration** - Automatic location detection

###  **Communication & Orders**
- ** WhatsApp Integration** - Direct ordering via WhatsApp
- ** Smart Cart System** - Multi-vendor cart management
- ** Order Tracking** - Real-time order status updates
- ** Review System** - Customer feedback and ratings

###  **Modern UI/UX**
- ** Beautiful Design** - Modern, clean interface with smooth animations
- ** Mobile-First** - Responsive design for all devices
- ** Framer Motion** - Smooth page transitions and micro-interactions
- ** Tailwind CSS** - Utility-first styling with custom design system

###  **Security & Performance**
- ** JWT Authentication** - Secure token-based authentication
- ** Role-Based Access** - Granular permission system
- ** Real-time Updates** - Socket.io for live data synchronization
- ** Optimized Performance** - Lazy loading and code splitting

---

##  Demo & Screenshots

### Landing Page
!![Landing Page](image-12.png)
*Modern landing page with bilingual support and clear call-to-actions*

### Customer Dashboard
![Customer Dashboard](image-13.png)
*Interactive map view with nearby vendors and real-time locations*

### Vendor Dashboard
![Vendor Dashboard](image-14.png)
*Comprehensive vendor management with analytics and order tracking*

---

##  Tech Stack

### **Frontend**
- ** React 18.2.0** - Modern React with hooks and context
- ** Tailwind CSS 3.3.3** - Utility-first CSS framework
- ** Framer Motion 12.24.12** - Animation library
- ** React Leaflet 4.2.1** - Interactive maps
- ** React Router 6.18.0** - Client-side routing
- ** Lucide React 0.263.1** - Beautiful icons
- ** React Toastify 10.0.4** - Toast notifications

### **Backend**
- ** Node.js 18+** - JavaScript runtime
- ** Express 5.2.1** - Web framework
- ** MongoDB 9.1.4** - NoSQL database
- ** JWT 9.0.3** - Authentication tokens
- ** bcryptjs 3.0.3** - Password hashing
- ** Socket.io 4.8.3** - Real-time communication
- ** Helmet 8.1.0** - Security middleware

### **Development Tools**
- ** Nodemon** - Auto-restart development server
- ** Jest** - Testing framework
- ** ESLint** - Code linting
- ** Prettier** - Code formatting

---

##  Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js 18+** ([Download](https://nodejs.org/))
- **MongoDB 5+** ([Download](https://www.mongodb.com/try/download/community))
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/vendorify.git
cd vendorify
```

2. **Install dependencies**
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies  
cd ../server
npm install
```

3. **Environment Setup**

Create `.env` file in the server directory:
```bash
cd server
cp .env.example .env
```

Configure your environment variables:
```env
# Database
MONGODB_URI=mongodb://127.0.0.1:27017/vendorify

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Optional: AI Integration
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

4. **Initialize Database**
```bash
cd server
npm run init-db
npm run verify
```

This creates test users:
- **Admin**: `admin@vendorify.com` / `admin123456`
- **Customer**: `customer@test.com` / `customer123`
- **Vendor**: `vendor@test.com` / `vendor123`

5. **Start Development Servers**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

6. **Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Health**: http://localhost:5001/api/health

---

##  Project Structure

```
vendorify/
├── client/                     # React Frontend Application
│   ├── public/                 # Static assets
│   │   ├── index.html             # HTML template
│   │   └── logo.svg               # App logo
│   ├── src/
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── common/         # Shared components (Navbar, Footer, etc.)
│   │   │   ├── map/            # Map-related components
│   │   │   ├── chat/           # Chat/messaging components
│   │   │   └── vendor/         # Vendor-specific components
│   │   ├── pages/              # Page Components
│   │   │   ├── customer/       # Customer pages (Dashboard, Orders, etc.)
│   │   │   ├── vendor/         # Vendor pages (Dashboard, Profile, etc.)
│   │   │   └── admin/          # Admin pages
│   │   ├── context/            # React Context Providers
│   │   │   ├── AuthContext.js     # Authentication state
│   │   │   └── AppDataContext.js  # Application data state
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── utils/              # Utility Functions
│   │   │   ├── api.js             # API client
│   │   │   ├── toast.js           # Toast notifications
│   │   │   └── navigation.js      # Navigation helpers
│   │   ├── constants/          # App Constants
│   │   └── styles/             # Global styles
│   ├── package.json               # Frontend dependencies
│   └── tailwind.config.js         # Tailwind configuration
├── server/                     # Node.js Backend Application
│   ├── controllers/            # Route Controllers
│   │   ├── authController.js      # Authentication logic
│   │   ├── vendorController.js    # Vendor management
│   │   └── orderController.js     # Order processing
│   ├── middleware/             # Express Middleware
│   │   ├── authMiddleware.js      # JWT authentication
│   │   ├── uploadMiddleware.js    # File upload handling
│   │   └── validationMiddleware.js # Input validation
│   ├── models/                 # MongoDB Models
│   │   ├── User.js                # User schema
│   │   ├── Vendor.js              # Vendor schema
│   │   ├── Order.js               # Order schema
│   │   ├── Product.js             # Product schema
│   │   └── Review.js              # Review schema
│   ├── routes/                 # API Routes
│   │   ├── authRoutes.js          # Authentication endpoints
│   │   ├── vendorRoutes.js        # Vendor endpoints
│   │   ├── orderRoutes.js         # Order endpoints
│   │   └── publicRoutes.js        # Public endpoints
│   ├── scripts/                # Database Scripts
│   │   ├── initDB.js              # Database initialization
│   │   ├── addTestVendors.js      # Add sample vendors
│   │   └── verifySetup.js         # Setup verification
│   ├── uploads/                # File Uploads
│   │   └──  shops/              # Shop images
│   ├──  utils/                  # Utility Functions
│   │   └── logger.js              # Logging utility
│   ├── index.js                   # Server entry point
│   └── package.json               # Backend dependencies
├── README.md                   # Project documentation
└── .gitignore                  # Git ignore rules
```

---

##  API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | User registration | `{ name, email, password, role, mobile }` |
| `POST` | `/api/auth/login` | User login | `{ email/mobile, password }` |
| `GET` | `/api/auth/me` | Get current user | - |
| `POST` | `/api/auth/logout` | User logout | - |

###  Vendor Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/vendors/profile` | Get vendor profile | Private |
| `PUT` | `/api/vendors/profile` | Update vendor profile | Private |
| `POST` | `/api/vendors/location` | Update location | Private |
| `GET` | `/api/vendors/dashboard/stats` | Get dashboard stats | Private |
| `POST` | `/api/vendors/products` | Add product | Private |
| `DELETE` | `/api/vendors/products/:id` | Delete product | Private |

###  Public Endpoints

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| `GET` | `/api/public/vendors/all` | Get all vendors | `category`, `lat`, `lng` |
| `GET` | `/api/public/vendors/nearby` | Get nearby vendors | `lat`, `lng`, `radius` |
| `GET` | `/api/public/vendors/search` | Search vendors | `q`, `category`, `lat`, `lng` |
| `GET` | `/api/public/vendors/:id` | Get vendor by ID | - |
| `GET` | `/api/public/vendors/:id/menu` | Get vendor menu | - |
| `GET` | `/api/public/vendors/:id/reviews` | Get vendor reviews | - |

###  Order Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/orders` | Get user orders | Private |
| `POST` | `/api/orders` | Create new order | Private |
| `GET` | `/api/orders/:id` | Get order details | Private |
| `PUT` | `/api/orders/:id/status` | Update order status | Private |

---

##  UI Components

###  Common Components

- ** Navbar** - Responsive navigation with role-based menus
- ** Footer** - Site footer with links and information
- ** LoadingSpinner** - Animated loading indicators
- ** ErrorBoundary** - Error handling and fallback UI
- ** ProgressiveImage** - Optimized image loading
- ** Button** - Consistent button styling
- ** Card** - Reusable card component

###  Map Components

- ** InteractiveVendorMap** - Main map with vendor markers
- ** MapIcons** - Custom map marker icons
- ** MapLegend** - Map legend and controls
- ** MapStyles** - Custom map styling

###  Chat Components

- ** ChatbotWidget** - AI-powered chat assistance
- ** ConditionalChatbot** - Context-aware chat display

---

##  Authentication

### Role-Based Access Control

```javascript
// User Roles
const ROLES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor', 
  ADMIN: 'admin'
};

// Protected Route Example
<ProtectedRoute requiredRole={ROLES.VENDOR}>
  <VendorDashboard />
</ProtectedRoute>
```

###  JWT Token Structure

```javascript
{
  "userId": "user_id_here",
  "role": "customer|vendor|admin",
  "iat": 1640995200,
  "exp": 1641600000
}
```

###  Security Features

- ** Password Hashing** - bcrypt with salt rounds
- ** JWT Tokens** - Secure authentication tokens
- ** Token Expiration** - Configurable token lifetime
- ** Route Protection** - Role-based access control
- ** Helmet.js** - Security headers
- ** Rate Limiting** - API request throttling

---

##  Maps & Location

###  Location Services

```javascript
// Geolocation Hook
const { location, error, loading } = useGeolocation();

// Find Nearby Vendors
const nearbyVendors = await api.getNearbyVendors(
  location.lat, 
  location.lng, 
  5000 // 5km radius
);
```

###  Map Features

- ** Real-time Tracking** - Live vendor location updates
- ** Proximity Search** - Distance-based vendor discovery
- ** Custom Markers** - Category-specific map icons
- ** Mobile Optimized** - Touch-friendly map controls
- ** Offline Support** - Cached map tiles

---

##  Real-time Features

###  Socket.io Integration

```javascript
// Client-side Socket Connection
const socket = io(CONFIG.API.SOCKET_URL);

// Real-time Events
socket.on('vendor_moved', (data) => {
  updateVendorLocation(data.vendorId, data.location);
});

socket.on('order_status_update', (data) => {
  updateOrderStatus(data.orderId, data.status);
});
```

###  Live Updates

- ** Vendor Location** - Real-time position tracking
- ** Order Status** - Live order progress updates
- ** Notifications** - Instant messaging and alerts
- ** Dashboard Metrics** - Live analytics updates

---

##  Mobile Responsive

###  Responsive Design

- ** Mobile-First** - Designed for mobile devices
- ** Desktop Optimized** - Enhanced desktop experience
- ** Tablet Support** - Optimized for tablet screens
- ** Adaptive Layout** - Flexible grid system

###  Design System

```css
/* Color Palette */
:root {
  --primary: #1A6950;      /* Forest Green */
  --secondary: #CDF546;    /* Lime Green */
  --background: #FDF9DC;   /* Cream */
  --text: #1F2937;         /* Dark Gray */
  --white: #FFFFFF;        /* Pure White */
}

/* Typography */
.font-heading { font-family: 'Inter', sans-serif; }
.font-body { font-family: 'Inter', sans-serif; }
```

---

##  Testing

###  Test Setup

```bash
# Run client tests
cd client
npm test

# Run server tests (when implemented)
cd server
npm test

# Run all tests
npm run test:all
```

###  Testing Strategy

- ** Component Tests** - React component testing
- ** API Tests** - Endpoint testing
- ** E2E Tests** - End-to-end user flows
- ** Performance Tests** - Load and performance testing

---

##  Troubleshooting

### Common Issues

####  "ECONNREFUSED" or "Server not reachable"
```bash
# Check if MongoDB is running
# Windows: Check Services or run `mongod`
# Mac: brew services start mongodb/brew/mongodb-community
# Linux: sudo systemctl start mongod

# Alternative: Use MongoDB Atlas (cloud)
# Update MONGODB_URI in server/.env to your Atlas connection string
```

####  "JWT_SECRET is not defined"
```bash
# Make sure server/.env file exists with JWT_SECRET
cd server
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
```

####  "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -rf client/node_modules server/node_modules
cd client && npm install
cd ../server && npm install
```

####  Maps not loading
- Check internet connection for map tiles
- Verify Leaflet CSS is loaded properly
- Check browser console for JavaScript errors

####  "Network Error" in browser
- Ensure backend server is running on port 5001
- Check CORS configuration in server/index.js
- Verify FRONTEND_URL in server/.env matches your client URL

### Performance Issues

####  Slow loading times
- Enable MongoDB indexes: `npm run add-indexes`
- Optimize images and reduce bundle size
- Check network tab in browser dev tools

####  Socket.io connection issues
- Check firewall settings
- Verify Socket.io server is running
- Check browser console for connection errors

### Development Tips

####  Hot reload not working
```bash
# For client
cd client && npm start

# For server  
cd server && npm run dev
```

####  Testing authentication
```bash
# Use the debug auth utility
node test-auth.js
```

####  Database issues
```bash
# Reset database
cd server
npm run init-db

# Verify setup
npm run verify
```

### Getting Help

- ** Documentation**: Check README.md and inline comments
- ** Issues**: Create a GitHub issue with error details
- ** Community**: Join our Discord server
- ** Support**: Contact support@vendorify.com

---

##  Deployment

###  Build for Production

```bash
# Build client
cd client
npm run build

# Start production server
cd server
npm start
```

###  Deployment Options

#### **Vercel (Frontend)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from client directory
cd client
vercel --prod
```

#### **Heroku (Full-stack)**
```bash
# Install Heroku CLI
# Create Procfile in root:
echo "web: cd server && npm start" > Procfile

# Deploy
heroku create vendorify-app
git push heroku main
```

#### **Railway (Full-stack)**
```bash
# Connect GitHub repo to Railway
# Set environment variables in Railway dashboard
# Deploy automatically on git push
```

#### **DigitalOcean App Platform**
```yaml
# app.yaml
name: vendorify
services:
- name: api
  source_dir: server
  github:
    repo: your-username/vendorify
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
- name: web
  source_dir: client
  github:
    repo: your-username/vendorify
    branch: main
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
```

###  Environment Variables for Production

```env
# Production Environment
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vendorify
JWT_SECRET=your-super-secure-production-jwt-secret
FRONTEND_URL=https://your-domain.com
PORT=5001

# Optional Production Settings
SESSION_SECRET=your-session-secret
REDIS_URL=redis://localhost:6379
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

###  Monitoring & Analytics

- **Error Tracking**: Sentry, Bugsnag
- **Performance**: New Relic, DataDog
- **Analytics**: Google Analytics, Mixpanel
- **Uptime**: Pingdom, UptimeRobot

---

##  Contributing

We welcome contributions! Please follow these steps:

###  Development Workflow

1. ** Fork the repository**
2. ** Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. ** Make your changes**
4. ** Test your changes**
   ```bash
   npm test
   ```
5. ** Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. ** Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. ** Open a Pull Request**

###  Code Style Guidelines

- ** ESLint** - Follow ESLint configuration
- ** Prettier** - Use Prettier for formatting
- ** Comments** - Add meaningful comments
- ** Tests** - Include tests for new features
- ** Documentation** - Update documentation

###  Bug Reports

Please include:
- ** Device/Browser** information
- ** Steps to reproduce**
- ** Screenshots** if applicable
- ** Error messages**

###  Feature Requests

- ** Description** - Clear feature description
- ** Use Case** - Why is this feature needed?
- ** Implementation** - Any implementation ideas
- ** Mockups** - Visual mockups if applicable

---

##  License

This project is licensed under the **MIT License** -
---

##  Acknowledgments

- ** React Team** - For the amazing React framework
- ** Tailwind CSS** - For the utility-first CSS framework
- ** Leaflet** - For the interactive maps
- ** Socket.io** - For real-time communication
- ** Framer Motion** - For smooth animations

---
---

<div align="center">


</div>
