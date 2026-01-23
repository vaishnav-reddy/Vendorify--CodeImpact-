# Vendorify - Premium Hyperlocal Vendor Platform

Vendorify is a comprehensive MERN-stack application designed to connect local vendors with customers through a seamless, real-time interface. It features text-based location management, real-time order tracking, and AI-powered menu generation.

## 🚀 Key Features

### For Customers
- **Real-time Discovery**: Find vendors nearby using text-based search or categories.
- **Live Order Tracking**: Watch your order status update in real-time (Pending → Preparing → Delivered).
- **Interactive Dashboard**: View order history, nearby deals, and roaming vendors.

### For Vendors
- **Business Profile**: Manage shop details, photos, and operational hours.
- **Order Management**: Accept/Reject orders and update status instantly.
- **AI Menu Builder**: Generate menu items with descriptions and prices using Gemini AI.
- **Performance Analytics**: Track earnings and ratings.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18, React Router v6
- **Styling**: Tailwind CSS, Framer Motion (Animations)
- **State/Context**: Context API (Auth & App Data)
- **Real-time**: Socket.io Client
- **UI Components**: Lucide React, React Toastify

### Backend
- **Runtime**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Security**: Helmet, Compression, Rate Limiting, JWT Auth
- **Real-time**: Socket.io Server
- **AI**: Google Gemini API

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas URI)

### 1. Clone & Install
```bash
git clone https://github.com/Kum4rX/Vendorify.git
cd Vendorify

# Install Frontend Dependencies
npm install

# Install Backend Dependencies
cd server
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vendorify
JWT_SECRET=your_super_secret_key_here
GEMINI_API_KEY=your_google_ai_key
```

### 3. Running the Application
You need to run both the backend and frontend servers.

**Terminal 1 (Backend):**
```bash
cd server
node index.js
```
*Server runs on http://localhost:5000*

**Terminal 2 (Frontend):**
```bash
# Return to root if in server dir
cd ..
npm start
```
*App runs on http://localhost:3000*

## 🔒 Security & Performance
- **Helmet**: Secures HTTP headers.
- **Compression**: Gzip compression for faster API responses.
- **Rate Limiting**: Protects against brute-force attacks (100 req/15min).
- **Validation**: Strict input validation on all API routes.

## 📂 Project Structure
```
├── server/                 # Express Backend
│   ├── models/             # Mongoose Schemas (User, Vendor, Order)
│   ├── routes/             # API Routes
│   ├── controllers/        # Business Logic
│   └── index.js            # Entry Point & Socket Setup
│
└── src/                    # React Frontend
    ├── components/         # Reusable UI Components
    ├── context/            # Global State (Auth, Socket, Data)
    ├── pages/              # Customer & Vendor Dashboards
    └── assets/             # Images & Icons
```

## 📄 License
MIT License. Built with ❤️ for the community.
