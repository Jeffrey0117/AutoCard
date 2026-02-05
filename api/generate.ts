// Vercel Serverless Function - AI Content Generation
// API keys are only accessible server-side (no VITE_ prefix)

import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允許 POST 請求' });
  }

  const { topic, pages = 4 } = req.body;

  if (!topic) {
    return res.status(400).json({ error: '請提供主題' });
  }

  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: 'API Key 未設定' });
  }

  const systemPrompt = `你是一位專業的社群媒體內容創作者，擅長製作吸引人的圖文卡片內容。

請根據用戶提供的主題，生成適合製作成社群圖文卡片的 Markdown 內容。

規則：
1. 使用繁體中文
2. 第一頁是封面，只需要一個吸引人的標題（用 # 標題格式）
3. 之後每一頁用 --- 分隔
4. 每頁內容要精簡，適合放在一張卡片上（約 50-100 字）
5. 善用 **粗體** 強調重點
6. 可以適當使用條列式 (-)
7. 生成 ${pages} 頁內容

範例格式：
# 標題

---

## 第一個重點

內容說明...

---

## 第二個重點

- 要點一
- 要點二

---

## 總結

結語...`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `請為以下主題生成社群圖文卡片內容：${topic}` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepSeek API Error:', error);
      return res.status(500).json({ error: 'AI 生成失敗' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return res.status(200).json({ content });
  } catch (error) {
    console.error('Generate Error:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}
