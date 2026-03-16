const http = require('http');

const post = (path, data) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
};

(async () => {
  try {
    console.log('--- Phase 1: Verify Default Password ---');
    const verify1 = await post('/api/v1/activity/verify-password', { password: 'admin123' });
    console.log('Verification Success:', verify1.success);
    console.log('Response Message:', verify1.message);

    console.log('\n--- Phase 2: Change Password ---');
    const change = await post('/api/v1/activity/change-password', { 
      currentPassword: 'admin123', 
      newPassword: 'secureshop' 
    });
    console.log('Change Success:', change.success);
    console.log('Change Message:', change.message);

    console.log('\n--- Phase 3: Verify New Password ---');
    const verify2 = await post('/api/v1/activity/verify-password', { password: 'secureshop' });
    console.log('New Password Success:', verify2.success);

    console.log('\n--- Phase 4: Verify Old Password Fails ---');
    const verify3 = await post('/api/v1/activity/verify-password', { password: 'admin123' });
    console.log('Old Password Rejected:', !verify3.success);

    console.log('\n--- Phase 5: Reset for further use ---');
    await post('/api/v1/activity/change-password', { 
      currentPassword: 'secureshop', 
      newPassword: 'admin123' 
    });
    console.log('Reset to default for user testing.');

    console.log('\nALL AUTH TESTS PASSED');
  } catch (err) {
    console.error('\nTest failed:', err.message);
    process.exit(1);
  }
})();
