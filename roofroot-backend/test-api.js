const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testUserManagement() {
  try {
    console.log('🧪 Testing RoofRoot User Management System...\n');

    // Test 1: Health Check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL.replace('/api', '')}/`);
    console.log('✅ Health check passed:', healthResponse.data.message);

    // Test 2: User Registration
    console.log('\n2. Testing user registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '+1234567890',
      agencyName: 'Test Agency',
      agencyDescription: 'Test agency description'
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful:', registerResponse.data.message);
    const token = registerResponse.data.token;
    console.log('Token received:', token.substring(0, 20) + '...');

    // Test 3: User Login
    console.log('\n3. Testing user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('✅ Login successful:', loginResponse.data.message);

    // Test 4: Get User Profile (authenticated)
    console.log('\n4. Testing get user profile...');
    const profileResponse = await axios.get(`${BASE_URL}/users/${registerResponse.data.user._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile retrieval successful:', profileResponse.data.message);

    // Test 5: Update User Profile
    console.log('\n5. Testing user profile update...');
    const updateData = {
      name: 'Updated Test User',
      phoneNumber: '+1987654321'
    };

    const updateResponse = await axios.put(`${BASE_URL}/users/${registerResponse.data.user._id}`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile update successful:', updateResponse.data.message);

    console.log('\n🎉 All tests passed! The user management system is working correctly.');
    console.log('\n📋 Summary:');
    console.log('- ✅ Health check');
    console.log('- ✅ User registration');
    console.log('- ✅ User login');
    console.log('- ✅ Profile retrieval');
    console.log('- ✅ Profile update');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n💡 Make sure the server is running with: npm run dev');
  }
}

// Run the test
testUserManagement(); 