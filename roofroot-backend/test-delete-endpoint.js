const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testDeleteEndpoint() {
  try {
    console.log('🧪 Testing Delete User Endpoint...\n');

    // Test 1: Try to delete without authentication
    console.log('1. Testing without authentication...');
    try {
      await axios.delete(`${BASE_URL}/auth/delete/123456789012345678901234`);
      console.log('❌ FAILED: Should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ PASSED: Correctly requires authentication');
      } else {
        console.log('❌ UNEXPECTED ERROR:', error.response?.data || error.message);
      }
    }

    // Test 2: Try to delete with invalid token
    console.log('\n2. Testing with invalid token...');
    try {
      await axios.delete(`${BASE_URL}/auth/delete/123456789012345678901234`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      console.log('❌ FAILED: Should reject invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ PASSED: Correctly rejects invalid token');
      } else {
        console.log('❌ UNEXPECTED ERROR:', error.response?.data || error.message);
      }
    }

    // Test 3: Try to delete non-existent user
    console.log('\n3. Testing with non-existent user ID...');
    try {
      await axios.delete(`${BASE_URL}/auth/delete/123456789012345678901234`, {
        headers: { Authorization: 'Bearer your-valid-token-here' }
      });
      console.log('❌ FAILED: Should handle non-existent user');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ PASSED: Correctly handles non-existent user');
      } else {
        console.log('❌ UNEXPECTED ERROR:', error.response?.data || error.message);
      }
    }

    console.log('\n📋 Manual Test Instructions:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Create test users using the user management API');
    console.log('3. Get JWT tokens for different user roles');
    console.log('4. Test the delete endpoint with different scenarios:');
    console.log('   - Customer deleting their own account');
    console.log('   - Customer trying to delete another account');
    console.log('   - Agency user trying to delete any account');
    console.log('   - Admin deleting customer/agency accounts');
    console.log('   - Admin trying to delete themselves');
    console.log('   - Admin trying to delete another admin');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n💡 Make sure the server is running with: npm run dev');
  }
}

// Run the test
testDeleteEndpoint(); 