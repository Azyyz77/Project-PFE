/**
 * Direct test of chatbot endpoint
 */

const http = require('http');

const data = JSON.stringify({
  message: 'Bonjour'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/chatbot/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Testing chatbot endpoint...');
console.log('URL:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Method:', options.method);
console.log('Body:', data);
console.log('');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  console.log('');

  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:');
    try {
      const parsed = JSON.parse(responseData);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ SUCCESS! Chatbot is working!');
      } else {
        console.log('\n❌ ERROR! Status:', res.statusCode);
      }
    } catch (e) {
      console.log(responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(data);
req.end();
