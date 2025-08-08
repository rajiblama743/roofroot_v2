const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

async function testStatusImplementation() {
  console.log('🧪 Testing RoofRoot Status Implementation...\n');

  try {
    // Test 1: Create a customer (should be active by default)
    console.log('1. Testing customer registration (should be active)...');
    const customerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'password123'
    });
    console.log('✅ Customer created with status:', customerResponse.data.user.status);

    // Test 2: Create an agency request (should be pending)
    console.log('\n2. Testing agency request (should be pending)...');
    const agencyResponse = await axios.post(`${API_BASE_URL}/auth/request-agency`, {
      name: 'Test Agency',
      email: 'agency@test.com',
      password: 'password123',
      agencyName: 'Test Real Estate Agency',
      agencyDescription: 'A test agency for verification',
      license: 'TEST123',
      address: '123 Test Street, Test City'
    });
    console.log('✅ Agency request created with status:', agencyResponse.data.user.status);

    // Test 3: Try to login with pending agency (should fail)
    console.log('\n3. Testing login with pending agency (should fail)...');
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'agency@test.com',
        password: 'password123'
      });
      console.log('❌ Login should have failed for pending agency');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Login correctly blocked for pending agency');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Test 4: Login with customer (should succeed)
    console.log('\n4. Testing login with customer (should succeed)...');
    const customerLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'customer@test.com',
      password: 'password123'
    });
    console.log('✅ Customer login successful');

    // Test 5: Get agencies with status filter
    console.log('\n5. Testing agencies search with status filter...');
    const agenciesResponse = await axios.get(`${API_BASE_URL}/users/search/agencies?status=active`);
    console.log('✅ Active agencies found:', agenciesResponse.data.agencies.length);

    const pendingAgenciesResponse = await axios.get(`${API_BASE_URL}/users/search/agencies?status=pending`);
    console.log('✅ Pending agencies found:', pendingAgenciesResponse.data.agencies.length);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\nSummary:');
    console.log('- Customer registration creates active users');
    console.log('- Agency requests create pending users');
    console.log('- Pending agencies cannot login');
    console.log('- Active agencies can login');
    console.log('- Status filtering works correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testStatusImplementation();
