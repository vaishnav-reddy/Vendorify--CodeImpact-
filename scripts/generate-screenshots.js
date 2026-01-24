const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function generateScreenshots() {
  console.log('🚀 Starting screenshot generation...');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport for desktop screenshots
    await page.setViewport({ width: 1200, height: 800 });
    
    console.log('📸 Capturing Landing Page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'landing-page.png'),
      fullPage: false
    });
    
    console.log('📸 Capturing Customer Login...');
    await page.goto('http://localhost:3000/login/customer', { waitUntil: 'networkidle0' });
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'customer-login.png'),
      fullPage: false
    });
    
    // Login as customer
    console.log('🔐 Logging in as customer...');
    await page.type('input[type="email"]', 'customer@test.com');
    await page.type('input[type="password"]', 'customer123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    console.log('📸 Capturing Customer Dashboard...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'customer-dashboard.png'),
      fullPage: false
    });
    
    // Logout
    console.log('🚪 Logging out...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    console.log('📸 Capturing Vendor Login...');
    await page.goto('http://localhost:3000/login/vendor', { waitUntil: 'networkidle0' });
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'vendor-login.png'),
      fullPage: false
    });
    
    // Login as vendor
    console.log('🔐 Logging in as vendor...');
    await page.type('input[type="tel"]', '9876543210'); // Assuming vendor has mobile
    await page.type('input[type="password"]', 'vendor123');
    await page.click('button[type="submit"]');
    
    // Wait a bit for potential redirect
    await page.waitForTimeout(2000);
    
    console.log('📸 Capturing Vendor Dashboard...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'vendor-dashboard.png'),
      fullPage: false
    });
    
    // Mobile screenshots
    console.log('📱 Capturing Mobile Screenshots...');
    await page.setViewport({ width: 375, height: 812 });
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'mobile-landing.png'),
      fullPage: false
    });
    
    await page.goto('http://localhost:3000/login/customer', { waitUntil: 'networkidle0' });
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'mobile-customer-login.png'),
      fullPage: false
    });
    
    await page.goto('http://localhost:3000/login/vendor', { waitUntil: 'networkidle0' });
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'mobile-vendor-login.png'),
      fullPage: false
    });
    
    console.log('✅ Screenshots generated successfully!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
    
  } catch (error) {
    console.error('❌ Error generating screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Check if servers are running
async function checkServers() {
  try {
    const response = await fetch('http://localhost:3000');
    if (!response.ok) {
      throw new Error('Frontend server not responding');
    }
    
    const apiResponse = await fetch('http://localhost:5001/api/health');
    if (!apiResponse.ok) {
      throw new Error('Backend server not responding');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Servers not running. Please start both servers:');
    console.log('Terminal 1: cd server && npm run dev');
    console.log('Terminal 2: cd client && npm start');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking if servers are running...');
  
  const serversRunning = await checkServers();
  if (!serversRunning) {
    process.exit(1);
  }
  
  console.log('✅ Servers are running, proceeding with screenshot generation...');
  await generateScreenshots();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateScreenshots };