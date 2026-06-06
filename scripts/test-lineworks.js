const jwt = require('jsonwebtoken');
require('dotenv').config();

const CLIENT_ID = process.env.LINEWORKS_CLIENT_ID || '';
const CLIENT_SECRET = process.env.LINEWORKS_CLIENT_SECRET || '';
const SERVICE_ACCOUNT = process.env.LINEWORKS_SERVICE_ACCOUNT || '';
const BOT_ID = process.env.LINEWORKS_BOT_ID || '';
const ADMIN_USER_ID = process.env.LINEWORKS_ADMIN_USER_ID || '';

function formatPrivateKey(rawKey) {
  if (!rawKey) return '';
  if (rawKey.includes('-----BEGIN PRIVATE KEY-----')) {
    return rawKey.replace(/\\n/g, '\n');
  }
  const cleanKey = rawKey.replace(/\s+/g, '');
  const chunks = cleanKey.match(/.{1,64}/g) || [];
  return `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----`;
}

const PRIVATE_KEY = formatPrivateKey(process.env.LINEWORKS_PRIVATE_KEY || '');

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET || !SERVICE_ACCOUNT || !PRIVATE_KEY) {
    throw new Error('LINE WORKS API credentials are not properly set in environment variables.');
  }

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  
  const payload = {
    iss: CLIENT_ID,
    sub: SERVICE_ACCOUNT,
    iat: iat,
    exp: exp,
  };

  const token = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });

  const params = new URLSearchParams();
  params.append('assertion', token);
  params.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('scope', 'bot bot.read bot.message');

  const response = await fetch('https://auth.worksmobile.com/oauth2/v2.0/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Failed to get LINE WORKS access token:', errText);
    throw new Error('Failed to get LINE WORKS access token');
  }

  const data = await response.json();
  return data.access_token;
}

async function test() {
  try {
    console.log('CLIENT_ID:', CLIENT_ID);
    console.log('SERVICE_ACCOUNT:', SERVICE_ACCOUNT);
    console.log('BOT_ID:', BOT_ID);
    console.log('ADMIN_USER_ID:', ADMIN_USER_ID);
    console.log('Attempting to get access token...');
    const token = await getAccessToken();
    console.log('Success! Token:', token.substring(0, 15) + '...');

    // メッセージ送信テスト
    if (ADMIN_USER_ID && BOT_ID) {
      console.log('Sending test message to admin user:', ADMIN_USER_ID);
      const message = {
        content: {
          type: 'text',
          text: '業務報告アプリからのテスト通知です。'
        }
      };
      const response = await fetch(`https://www.worksapis.com/v1.0/bots/${BOT_ID}/users/${ADMIN_USER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Failed to send message:', errText);
      } else {
        console.log('Message sent successfully!');
      }
    }
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
