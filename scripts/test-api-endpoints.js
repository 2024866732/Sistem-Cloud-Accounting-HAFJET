const axios = require('axios');

const BASE_URL = process.env.TARGET_URL || 'http://localhost:5001';

const testEndpoints = async () => {
  console.log(`Testing API at: ${BASE_URL}`);
  let failed = 0;
  let passed = 0;

  // Test 1: Health Check
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    if (response.status === 200 && response.data.status === 'ok') {
      console.log('✅ Test 1/2: Health Check Passed');
      passed++;
    } else {
      throw new Error(`Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('❌ Test 1/2: Health Check Failed:', error.message);
    failed++;
  }

  // Test 2: Login with invalid credentials (expects 401)
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@test.com',
      password: 'wrongpassword'
    });
    // If it gets here, it's a failure because it should have thrown an error
    console.error('❌ Test 2/2: Invalid Login Test Failed: Expected 401 but got 200');
    failed++;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Test 2/2: Invalid Login Test Passed (Received 401 as expected)');
      passed++;
    } else {
      console.error('❌ Test 2/2: Invalid Login Test Failed:', error.message);
      failed++;
    }
  }
  
  console.log('\n--- Test Summary ---');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('--------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
};

testEndpoints();
