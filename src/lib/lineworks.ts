import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const CLIENT_ID = 'Gys42U_cPd7hdF4MmKCz';
const CLIENT_SECRET = '3lTWpvVe2O';
const SERVICE_ACCOUNT = '5by15.serviceaccount@izawaironworks';

function formatPrivateKey(rawKey: string): string {
  if (!rawKey) return '';
  if (rawKey.includes('-----BEGIN PRIVATE KEY-----')) {
    return rawKey.replace(/\\n/g, '\n');
  }
  const cleanKey = rawKey.replace(/\s+/g, '');
  const chunks = cleanKey.match(/.{1,64}/g) || [];
  return `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----`;
}

const RAW_PRIVATE_KEY = `MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCsqvmed+/SGBpB
yBRrjk3eUYiCJMoNowQQ/dmDGy2oa2A/gygLg+rYtI+LV9VMYaqByF8OkNf8MXW+
yUGe8yh+o6KewyvASXwBEm5H9bfB9xSGqn5gIjcd0rTfWrofVUh+IuvvJ5vzSflQ
vClmDGSoy1/HfPBnoTtr60Q56/p5UOcS2CfRGOWTfN8P6ZkEuVh81HH+xL4WV+q8
MOa0Dm3X3QL147leGnp8mWwwslvP9tLVsOAeA0pnpHXvftAzRjlDESWNuslLstN2
aM935VggfF+9XD8QdW9dvzoMwfi+y1U7JBRZhHoDb8IFlTo6KvqFtpBHqWkq7xCS
vtyWyLklAgMBAAECggEAET9w+OHtLFTpBooodAf+gkcttiZbopoWlWXuHNkRqgGz
1xRQYzoVsvjyX85xyZP19snfqPJSCOid5OVwryKF+IR7AZXoYGhWwTqolnqWlQML
41nTjuHMFKgQFkGXVvrrZ2IwpC6WNuq8Q1LQZde2FGBgXGqADzH9YA3bvldyqTyA
CbJcum73B4ztyLlqGOsTDKLFUpggQ41nHig6QIFbtO9KJSKQIRTWHE9rMvogZAW1
lvtdyzZfweV0GL7AQyIziY3T9tKQD7GRh7wS+kvE2826FuBH37xOoNsKwzaSFfvi
oDw+/V0ylwYZapczz+vabimhJf3RKyGe1FVwU0R5QQKBgQDFOIIboT3Zf5TmmA/t
9FfLYgqUL7XwOglsq6oemaPDdwvbQAwE9nwhV7HeQj2zq7OyYI5db53dcw/C0V+B
mynnP/DRrevTMozlrOgdcv67ueJdL1ZodpDYfYBZA07l1uw8VMlnTGw6Z359Oue2
KMZ+kw9mEpCxvy9DQpjp3WIEhQKBgQDgISOu+Aui7JZ7haqDxSf4dXXP6Y2qdrSl
sesW1OxKNTcZL5FiQmReJNM9NBu3zB2t83b8WlpwNcesU0CQvpx0FE4NUltaPt3R
2KO9+2KTW7wZnE+BIaDOZBatd3h/FRlawf7mmDflaQ/Dc/y3nQeOqK8NSN2LaQ8q
t4Lu7EjUIQKBgQC27THo1MbcXPTMaZCk4nUoRPiQ+Cvl9L7XF+aD2XfHDj1mEGLV
m5YJCyEEiSZX51OWiO6jharEQzwENFVEjpnauxAX/QTgZikU5s77XSOxNxMGGMqI
4c39jg818+vaYjWcMIaWQ0tot704tUWx64Yo0th+kYu6Ah2hYj0Y9ek7TQKBgQCx
NWKKT/KbYeZlSb0VLIg66Vw6BFaPRgX00GSpC7a7wbGLx1Fy2D2VNhaS2KVlwAxj
YhFc22+QMuVp+fUdvKflG7zOyaQTCYvHBDwK1T0Od8SUl0NBPT5wkTBg/QoXqK4A
VUxeNFJVn6joB8fzwUOdZv/pSAhq1qk4RBpRIB9BIQKBgDe9337RbiMW8+Y/TfGV
Z4oDiGyOg03Zmp5pBI6MJlOFaGIEkeOk6mrpcJEW/CDpRl2vy3az++yx8sqB4J+j
LSScZZsH8nstE9lJZnj8ZMo9F67gFClh9SH95NYH7Q2QFElYeNf8+w7i0Eee6CaO
VdvE0EP+ByKK9/ImPFDzwWUZ`;

const PRIVATE_KEY = formatPrivateKey(RAW_PRIVATE_KEY);
const BOT_ID = '12270440';

const getNextAuthUrl = () => {
  return 'https://field-report-app-ecru.vercel.app';
};

/**
 * LINE WORKS API 2.0 のアクセストークンを取得する
 */
export async function getAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET || !SERVICE_ACCOUNT || !PRIVATE_KEY) {
    throw new Error('LINE WORKS API credentials are not properly set in environment variables.');
  }

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; // 1時間有効
  
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
    throw new Error(`Failed to get LINE WORKS access token: ${errText}`);
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
  const targetUserId = userId || process.env.LINEWORKS_ADMIN_USER_ID || 'iz.24161@izawaironworks';
  if (!targetUserId) {
    console.warn('No target userId for LINE WORKS notification');
    return;
  }

  try {
    const accessToken = await getAccessToken();

    const displayTitle = title ? title : (memoText ? memoText.substring(0, 50) + '...' : '報告内容なし');

    const message = {
      content: {
        type: 'button_template',
        contentText: `新しい業務報告が提出されました。\n\n【報告者】${reporterName}\n【現場】${siteName}\n【内容】${displayTitle}`,
        actions: [
          {
            type: 'postback',
            label: '確認済みにする',
            data: `action=check&reportId=${reportId}`,
            displayText: '確認済みにする'
          },
          {
            type: 'uri',
            label: 'アプリで詳細を見る',
            uri: `${getNextAuthUrl()}/reports/${reportId}`
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
      
      // DBにAPI送信エラーを記録します
      try {
        const systemUser = await prisma.user.findFirst();
        if (systemUser) {
          await prisma.comment.create({
            data: {
              reportId: reportId,
              userId: systemUser.id,
              text: `[LINE WORKS通知エラー] Status: ${response.status}, Details: ${errText}`
            }
          });
        }
      } catch (dbErr) {
        console.error('Failed to write notify error to DB:', dbErr);
      }
    } else {
      console.log('LINE WORKS notification sent successfully to:', targetUserId);
    }
  } catch (error) {
    console.error('Error sending LINE WORKS notification:', error);
    
    // DBにシステム例外を記録します
    try {
      const systemUser = await prisma.user.findFirst();
      if (systemUser) {
        await prisma.comment.create({
          data: {
            reportId: reportId,
            userId: systemUser.id,
            text: `[LINE WORKS通知例外] Error: ${(error as Error).message}\nStack: ${(error as Error).stack?.substring(0, 300)}`
          }
        });
      }
    } catch (dbErr) {
      console.error('Failed to write notify exception to DB:', dbErr);
    }
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
