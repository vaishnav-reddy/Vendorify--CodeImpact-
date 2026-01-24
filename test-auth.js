// Simple authentication test script
const API_BASE_URL = 'http://localhost:5001/api';

async function testAuth() {
    console.log('🧪 Testing Authentication Flow...\n');

    // Test 1: Register a new vendor
    console.log('1️⃣ Testing Vendor Registration...');
    try {
        const vendorData = {
            name: 'Test Vendor',
            shopName: 'Test Shop',
            mobile: '9876543210',
            email: 'testvendor@example.com',
            password: 'password123',
            address: 'Test Address, Test City',
            latitude: 28.6139,
            longitude: 77.2090,
            role: 'vendor'
        };

        const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vendorData)
        });

        const registerResult = await registerResponse.json();
        
        if (registerResult.success) {
            console.log('✅ Vendor registration successful');
            console.log(`   User ID: ${registerResult.user.id}`);
            console.log(`   Role: ${registerResult.user.role}`);
            console.log(`   Token received: ${registerResult.token ? 'Yes' : 'No'}`);
            
            // Test 2: Verify token with /me endpoint
            console.log('\n2️⃣ Testing Token Verification...');
            const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${registerResult.token}` }
            });
            
            const meResult = await meResponse.json();
            if (meResult.success) {
                console.log('✅ Token verification successful');
                console.log(`   User: ${meResult.user.name}`);
                console.log(`   Role: ${meResult.user.role}`);
            } else {
                console.log('❌ Token verification failed:', meResult.message);
            }

            // Test 3: Access protected vendor route
            console.log('\n3️⃣ Testing Protected Vendor Route...');
            const profileResponse = await fetch(`${API_BASE_URL}/vendors/profile`, {
                headers: { 'Authorization': `Bearer ${registerResult.token}` }
            });
            
            const profileResult = await profileResponse.json();
            if (profileResult.success) {
                console.log('✅ Protected route access successful');
                console.log(`   Shop Name: ${profileResult.vendor?.shopName || 'Not set'}`);
            } else {
                console.log('❌ Protected route access failed:', profileResult.message);
            }

            // Test 4: Login with the same credentials
            console.log('\n4️⃣ Testing Login...');
            const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobile: vendorData.mobile,
                    password: vendorData.password
                })
            });

            const loginResult = await loginResponse.json();
            if (loginResult.success) {
                console.log('✅ Login successful');
                console.log(`   User: ${loginResult.user.name}`);
                console.log(`   Role: ${loginResult.user.role}`);
            } else {
                console.log('❌ Login failed:', loginResult.message);
            }

        } else {
            console.log('❌ Vendor registration failed:', registerResult.message);
        }

    } catch (error) {
        console.log('❌ Test failed with error:', error.message);
    }

    console.log('\n🏁 Authentication test completed!');
}

// Test 5: Register a customer
async function testCustomerAuth() {
    console.log('\n5️⃣ Testing Customer Registration...');
    try {
        const customerData = {
            name: 'Test Customer',
            mobile: '9876543211',
            email: 'testcustomer@example.com',
            password: 'password123',
            role: 'customer'
        };

        const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
        });

        const registerResult = await registerResponse.json();
        
        if (registerResult.success) {
            console.log('✅ Customer registration successful');
            console.log(`   User ID: ${registerResult.user.id}`);
            console.log(`   Role: ${registerResult.user.role}`);
        } else {
            console.log('❌ Customer registration failed:', registerResult.message);
        }

    } catch (error) {
        console.log('❌ Customer test failed with error:', error.message);
    }
}

// Run tests
if (require.main === module) {
    testAuth().then(() => testCustomerAuth());
}

module.exports = { testAuth, testCustomerAuth };