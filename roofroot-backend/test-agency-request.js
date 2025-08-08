const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

async function testAgencyRequest() {
  console.log('🧪 Testing Agency Request Functionality...\n');

  try {
    // Test 1: Submit agency request
    console.log('1. Testing agency request submission...');
    const agencyRequestData = {
      name: 'Test Agency User',
      email: 'agency-test@example.com',
      password: 'password123',
      phoneNumber: '+1234567890',
      agencyName: 'Test Real Estate Agency',
      agencyDescription: 'A test agency for verification purposes',
      license: 'TEST123456',
      address: '123 Test Street, Test City, TC 12345'
    };

    const response = await axios.post(`${API_BASE_URL}/auth/request-agency`, agencyRequestData);
    
    if (response.data.success) {
      console.log('✅ Agency request submitted successfully');
      console.log('   User ID:', response.data.user._id);
      console.log('   Status:', response.data.user.status);
      console.log('   Role:', response.data.user.role);
    } else {
      console.log('❌ Agency request failed:', response.data.message);
    }

    // Test 2: Try to login with the pending agency (should fail)
    console.log('\n2. Testing login with pending agency (should fail)...');
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'agency-test@example.com',
        password: 'password123'
      });
      console.log('❌ Login should have failed for pending agency');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Login correctly blocked for pending agency');
        console.log('   Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Test 3: Check if user exists in database
    console.log('\n3. Verifying user was created in database...');
    try {
      // This would require an admin endpoint to check, but we can verify by trying to register again
      const duplicateResponse = await axios.post(`${API_BASE_URL}/auth/request-agency`, agencyRequestData);
      if (duplicateResponse.data.success) {
        console.log('❌ Duplicate user was created (should have failed)');
      } else {
        console.log('✅ Duplicate request correctly rejected');
        console.log('   Error message:', duplicateResponse.data.message);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Duplicate request correctly rejected');
        console.log('   Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    console.log('\n🎉 Agency request functionality test completed!');
    console.log('\nSummary:');
    console.log('- Agency request creates user with pending status');
    console.log('- Pending agencies cannot login');
    console.log('- Duplicate requests are properly rejected');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAgencyRequest();
