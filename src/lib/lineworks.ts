import jwt from 'jsonwebtoken';

const CLIENT_ID = process.env.LINEWORKS_CLIENT_ID || '';
const CLIENT_SECRET = process.env.LINEWORKS_CLIENT_SECRET || '';
const SERVICE_ACCOUNT = process.env.LINEWORKS_SERVICE_ACCOUNT || '';
function formatPrivateKey(rawKey: string): string {
  if (!rawKey) return '';
  if (rawKey.includes('-----BEGIN PRIVATE KEY-----')) {
    return rawKey.replace(/\\n/g, '\n');
  }
  const cleanKey = rawKey.replace(/\s+/g, '');
  const chunks = cleanKey.match(/.{1,64}/g) || [];
  return `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----`;
}

const PRIVATE_KEY = formatPrivateKey(process.env.LINEWORKS_PRIVATE_KEY || '');
const BOT_ID = process.env.LINEWORKS_BOT_ID || '';

/**
 * LINE WORKS API 2.0 のアクセストークンを取得する
 */
export async function getAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET || !SERVICE_ACCOUNT || !PRIVATE_KEY) {
    throw new Error('LINE WORKS API credentials are not properly set in environment variables.');
  }

  // 1. JWTの発行
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; // 1時間有効
  
  const payload = {
    iss: CLIENT_ID,
    sub: SERVICE_ACCOUNT,
    iat: iat,
    exp: exp,
  };

  const token = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });

  // 2. アクセストークンの取得
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

/**
 * 報告の通知メッセージ（アクションボタン付き）を送信する
 */
export async function sendReportNotification(
  userId: string,
  reportId: string,
  reportNo: string,
  reporterName: string,
  siteName: string,
  title: string,
  memoText: string
) {
  const targetUserId = userId || process.env.LINEWORKS_ADMIN_USER_ID;
  if (!targetUserId) {
    console.warn('No target userId for LINE WORKS notification');
    return;
  }

  try {
    const accessToken = await getAccessToken();

    const displayTitle = title ? title : (memoText ? memoText.substring(0, 50) + '...' : '報告内容なし');

    // Button Template形式のメッセージ
    const message = {
      content: {
        type: 'button_template',
        contentText: `新しい業務報告が提出されました。\n\n【報告者】${reporterName}\n【現場】${siteName}\n【内容】${displayTitle}`,
        actions: [
          {
            type: 'message',
            label: '確認済みにする',
            postback: `action=check&reportId=${reportId}`
          },
          {
            type: 'uri',
            label: 'アプリで詳細を見る',
            uri: `${process.env.NEXTAUTH_URL}/reports/${reportId}`
          }
        ]
      }
    };

    const response = await fetch(`https://www.worksapis.com/v1.0/bots/${BOT_ID}/users/${targetUserId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Failed to send LINE WORKS notification:', errText);
    } else {
      console.log('LINE WORKS notification sent successfully to:', targetUserId);
    }
  } catch (error) {
    console.error('Error sending LINE WORKS notification:', error);
  }
}

/**
 * 報告者へテキストメッセージを送信する（上司からのコメントや確認通知）
 */
export async function sendTextMessage(userId: string, text: string) {
  if (!userId) return;

  try {
    const accessToken = await getAccessToken();

    const message = {
      content: {
        type: 'text',
        text: text
      }
    };

    const response = await fetch(`https://www.worksapis.com/v1.0/bots/${BOT_ID}/users/${userId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Failed to send LINE WORKS text message:', errText);
    }
  } catch (error) {
    console.error('Error sending LINE WORKS text message:', error);
  }
}
