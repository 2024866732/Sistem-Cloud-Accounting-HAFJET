const request = require('supertest');

async function main() {
  let app;
  try {
    app = require('../dist/index');
    app = app && app.default ? app.default : app;
  } catch (e) {
    console.error('Could not load dist/index.js:', e.message || e);
    process.exit(2);
  }

  try {
    const res = await request(app).get('/api/ready');
    console.log('Status:', res.status, 'Body:', res.body);
    if (res.status === 200) process.exit(0);
    // Accept 503 as a valid not-ready state but not a failure for smoke
    if (res.status === 503) process.exit(0);
    process.exit(3);
  } catch (err) {
    console.error('Request failed:', err.message || err);
    process.exit(4);
  }
}

main();
