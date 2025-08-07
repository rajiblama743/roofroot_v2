const axios = require('axios');

const API_BASE_URL = 'https://roofroot-v2.onrender.com/api';

async function testAPI() {
  console.log('🧪 Testing API connectivity...');
  console.log('API URL:', API_BASE_URL);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 10000
    });
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test root endpoint
    console.log('\n2. Testing root endpoint...');
    const rootResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}`, {
      timeout: 10000
    });
    console.log('✅ Root endpoint passed:', rootResponse.data);
    
    // Test CORS preflight
    console.log('\n3. Testing CORS preflight...');
    const corsResponse = await axios.options(`${API_BASE_URL}/auth/login`, {
      timeout: 10000,
      headers: {
        'Origin': 'https://roofroot-web.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    console.log('✅ CORS preflight passed:', corsResponse.headers);
    
    console.log('\n🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
  }
}

testAPI();
