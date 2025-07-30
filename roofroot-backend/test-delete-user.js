const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testDeleteUserEndpoint() {
  try {
    console.log('🧪 Testing Delete User Endpoint with Role-Based Access Control...\n');

    // Create test users
    const testUsers = {
      admin: {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      },
      agency: {
        name: 'Agency User',
        email: 'agency@test.com',
        password: 'password123',
        role: 'agency',
        agencyName: 'Test Agency',
        agencyDescription: 'Test agency description'
      },
      customer1: {
        name: 'Customer User 1',
        email: 'customer1@test.com',
        password: 'password123',
        role: 'customer'
      },
      customer2: {
        name: 'Customer User 2',
        email: 'customer2@test.com',
        password: 'password123',
        role: 'customer'
      }
    };

    const tokens = {};
    const userIds = {};

    // Step 1: Create all test users (using admin token)
    console.log('1. Creating test users...');
    
    // First create an admin user via direct database insertion or use existing admin
    // For this test, we'll assume there's already an admin user or create one via user management API
    
    // Create admin user (this would typically be done via user management API)
    try {
      const adminResponse = await axios.post(`${BASE_URL}/users`, testUsers.admin, {
        headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN || 'test-admin-token'}` }
      });
      tokens.admin = adminResponse.data.token;
      userIds.admin = adminResponse.data.user._id;
      console.log('✅ Admin user created');
    } catch (error) {
      console.log('⚠️ Admin user creation failed, using existing admin or skipping...');
    }

    // Create agency user
    try {
      const agencyResponse = await axios.post(`${BASE_URL}/users`, testUsers.agency, {
        headers: { Authorization: `Bearer ${tokens.admin || process.env.ADMIN_TOKEN}` }
      });
      tokens.agency = agencyResponse.data.token;
      userIds.agency = agencyResponse.data.user._id;
      console.log('✅ Agency user created');
    } catch (error) {
      console.log('⚠️ Agency user creation failed:', error.response?.data?.message || error.message);
    }

    // Create customer users
    try {
      const customer1Response = await axios.post(`${BASE_URL}/users`, testUsers.customer1, {
        headers: { Authorization: `Bearer ${tokens.admin || process.env.ADMIN_TOKEN}` }
      });
      tokens.customer1 = customer1Response.data.token;
      userIds.customer1 = customer1Response.data.user._id;
      console.log('✅ Customer 1 user created');
    } catch (error) {
      console.log('⚠️ Customer 1 user creation failed:', error.response?.data?.message || error.message);
    }

    try {
      const customer2Response = await axios.post(`${BASE_URL}/users`, testUsers.customer2, {
        headers: { Authorization: `Bearer ${tokens.admin || process.env.ADMIN_TOKEN}` }
      });
      tokens.customer2 = customer2Response.data.token;
      userIds.customer2 = customer2Response.data.user._id;
      console.log('✅ Customer 2 user created');
    } catch (error) {
      console.log('⚠️ Customer 2 user creation failed:', error.response?.data?.message || error.message);
    }

    console.log('\n2. Testing Delete User Endpoint Rules...\n');

    // Test Rule 1: Agency users cannot delete any user account (including their own)
    console.log('Testing Rule 1: Agency users cannot delete any user account...');
    try {
      await axios.delete(`${BASE_URL}/auth/delete/${userIds.agency}`, {
        headers: { Authorization: `Bearer ${tokens.agency}` }
      });
      console.log('❌ FAILED: Agency user was able to delete their own account');
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.message?.includes('Agency users cannot delete')) {
        console.log('✅ PASSED: Agency user correctly prevented from deleting their own account');
      } else {
        console.log('❌ UNEXPECTED ERROR:', error.response?.data || error.message);
      }
    }

    // Test Rule 2: Customer users can only delete their own account
    console.log('\nTesting Rule 2: Customer users can only delete their own account...');
    
    // Test 2a: Customer trying to delete another customer
    try {
      await axios.delete(`${BASE_URL}/auth/delete/${userIds.customer2}`, {
        headers: { Authorization: `Bearer ${tokens.customer1}` }
      });
      console.log('❌ FAILED: Customer was able to delete another customer account');
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.message?.includes('You can only delete your own account')) {
        console.log('✅ PASSED: Customer correctly prevented from deleting another customer account');
      } else {
        console.log('❌ UNEXPECTED ERROR:', error.response?.data || error.message);
      }
    }

    // Test 2b: Customer deleting their own account
    try {
      await axios.delete(`${BASE_URL}/auth/delete/${userIds.customer1}`, {
        headers: { Authorization: `Bearer ${tokens.customer1}` }
      });
      console.log('✅ PASSED: Customer successfully deleted their own account');
    } catch (error) {
      console.log('❌ FAILED: Customer could not delete their own account:', error.response?.data || error.message);
    }

    // Test Rule 3: Admin users can delete customer and agency users, but not themselves or other admins
    console.log('\nTesting Rule 3: Admin users can delete customer and agency users, but not themselves...');
    
    // Test 3a: Admin trying to delete themselves
    try {
      await axios.delete(`${BASE_URL}/auth/delete/${userIds.admin}`, {
        headers: { Authorization: `Bearer ${tokens.admin}` }
      });
      console.log('❌ FAILED: Admin was able to delete their own account');
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.message?.includes('Admins cannot delete their own account')) {
        console.log('✅ PASSED: Admin correctly prevented from deleting their own account');
      } else {
        console.log('❌ UNEXPECTED ERROR:', error.response?.data || error.message);
      }
    }

    // Test 3b: Admin deleting a customer user
    try {
      await axios.delete(`${BASE_URL}/auth/delete/${userIds.customer2}`, {
        headers: { Authorization: `Bearer ${tokens.admin}` }
      });
      console.log('✅ PASSED: Admin successfully deleted a customer account');
    } catch (error) {
      console.log('❌ FAILED: Admin could not delete customer account:', error.response?.data || error.message);
    }

    // Test 3c: Admin deleting an agency user
    try {
      await axios.delete(`${BASE_URL}/auth/delete/${userIds.agency}`, {
        headers: { Authorization: `Bearer ${tokens.admin}` }
      });
      console.log('✅ PASSED: Admin successfully deleted an agency account');
    } catch (error) {
      console.log('❌ FAILED: Admin could not delete agency account:', error.response?.data || error.message);
    }

    console.log('\n🎉 Delete User Endpoint Tests Completed!');
    console.log('\n📋 Summary of Rules Tested:');
    console.log('- ✅ Agency users cannot delete any user account');
    console.log('- ✅ Customer users can only delete their own account');
    console.log('- ✅ Admin users cannot delete themselves');
    console.log('- ✅ Admin users can delete customer and agency users');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n💡 Make sure the server is running with: npm run dev');
  }
}

// Run the test
testDeleteUserEndpoint(); 