const https = require('https');

const data = JSON.stringify({
  type: 'postback',
  source: {
    userId: 'iz.24161@izawaironworks'
  },
  data: 'action=check&reportId=dummy'
});

const options = {
  hostname: 'field-report-app-ecru.vercel.app',
  port: 443,
  path: '/api/lineworks/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`Response Body: ${body}`);
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});

req.write(data);
req.end();
