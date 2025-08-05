const axios = require('axios');

async function testBackend() {
  try {
    console.log('Testing backend connection...');
    
    // Test basic connection
    const response = await axios.get('http://localhost:5000');
    console.log('✅ Backend is running:', response.data);
    
    // Test auth routes
    const authResponse = await axios.get('http://localhost:5000/api/auth/test');
    console.log('✅ Auth routes working:', authResponse.data);
    
    // Test event routes
    const eventResponse = await axios.get('http://localhost:5000/api/events/test');
    console.log('✅ Event routes working:', eventResponse.data);
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
  }
}

testBackend(); 