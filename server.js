/**
 * AutoCard - Self-hosted Express Server
 * Wraps Vercel-style API handlers for standalone deployment
 */

import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'autocard_default_secret';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || '';

app.use(express.json());

// ===== Auth =====

// POST /api/login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (!AUTH_PASSWORD) return res.json({ success: true, token: 'no-auth' });
  if (password !== AUTH_PASSWORD) {
    return res.status(401).json({ error: '密碼錯誤' });
  }
  const token = jwt.sign({ role: 'user', iat: Math.floor(Date.now() / 1000) }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ success: true, token });
});

// GET /api/verify
app.get('/api/verify', (req, res) => {
  if (!AUTH_PASSWORD) return res.json({ valid: true });
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true });
  } catch {
    return res.status(401).json({ valid: false });
  }
});

// Auth middleware - 保護以下所有 /api/* 路由
app.use('/api', (req, res, next) => {
  if (!AUTH_PASSWORD) return next();
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: '請先登入' });
  }
});

// ===== API Routes =====

// POST /api/generate - DeepSeek content generation
app.post('/api/generate', async (req, res) => {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  const { topic, pages = 4 } = req.body;

  if (!topic) return res.status(400).json({ error: '請提供主題' });
  if (!DEEPSEEK_API_KEY) return res.status(500).json({ error: 'API Key 未設定' });

  const systemPrompt = `你是一位專業的社群媒體內容創作者，擅長製作吸引人的圖文卡片內容。

請根據用戶提供的主題，生成適合製作成社群圖文卡片的 Markdown 內容。

⚠️ 嚴格字數限制（非常重要）：
- 封面頁：只放一個標題（# 格式），最多 15 字，不要有其他內容
- 內容頁：每頁最多 60 個中文字（含標點），不可超過
- 每頁最多 5 個條列項目，每項最多 12 個字
- 如果內容太多，寧可多分幾頁也不要塞滿一頁

格式規則：
1. 使用繁體中文
2. 第一頁是封面，只放一個 # 標題
3. 每一頁用 --- 分隔（前後各空一行）
4. 每頁一個 ## 小標題 + 2~4 行精簡內容
5. 善用 **粗體** 強調重點
6. 可以使用條列式 (-)，但每項要短
7. 生成 ${pages} 頁內容（含封面）
8. 最後一頁是總結或行動呼籲，同樣精簡

範例格式：
# 五個提升效率的秘訣

---

## 番茄鐘工作法

每 25 分鐘專注工作
休息 5 分鐘再繼續
**減少分心，效率加倍**

---

## 善用待辦清單

- 每天列出 3 件重要事
- 完成後打勾獲得成就感
- 避免多工處理

---

## 開始行動吧

選一個方法，今天就試試
**小改變帶來大進步**`;

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
    return res.json({ content });
  } catch (error) {
    console.error('Generate Error:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
});

// POST /api/gemini - Gemini AI operations
app.post('/api/gemini', async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const { action, text, topic, isThreadMode } = req.body;

  if (!GEMINI_API_KEY) return res.status(500).json({ error: 'API Key 未設定' });

  try {
    let systemInstruction = '';
    let userContent = '';

    switch (action) {
      case 'summarize':
        systemInstruction = '你是一位專業編輯。請簡潔地總結提供的文字，同時保留關鍵要點。使用繁體中文回覆。';
        userContent = text;
        break;
      case 'improve':
        systemInstruction = '你是一位專業文案寫手。請將提供的文字改寫得更吸引人、更清晰、更有影響力。保持原意但改善文句流暢度和用詞。使用繁體中文回覆。';
        userContent = text;
        break;
      case 'fix_grammar':
        systemInstruction = '你是一位嚴格的校對員。請修正提供文字中的所有語法、拼寫和標點符號錯誤。不要改變風格，只修正錯誤。使用繁體中文回覆。';
        userContent = text;
        break;
      case 'make_social':
        systemInstruction = '你是一位社群媒體經理。請將文字改寫成適合 Instagram 或 LinkedIn 的格式。使用表情符號、短段落和吸引人的開頭。使用繁體中文回覆。';
        userContent = text;
        break;
      case 'from_topic':
        systemInstruction = '你是一位專門製作病毒式傳播、美感部落格文章的內容創作者。使用繁體中文回覆。';
        userContent = `請用繁體中文撰寫一篇關於「${topic}」的短文。使用 Markdown 格式，包含標題、副標題、條列要點和引言。`;
        break;
      case 'social_caption': {
        systemInstruction = '你是病毒式社群媒體專家。你輸出乾淨的純文字。使用繁體中文。';
        const plainTextInstruction = '重要：只回傳純文字。不要使用 Markdown 格式（不要用粗體 **、斜體 *、標題 #）。只用純文字加上表情符號。使用繁體中文。';
        userContent = isThreadMode
          ? `內容：${text}\n\n將以下內容轉換成「串文」風格的社群媒體貼文系列。${plainTextInstruction} 將內容分成多個連貫的部分。第一部分要是強力的開頭吸引注意。最後一部分要是行動呼籲。使用 "|||" 作為每部分的分隔符。每部分保持在 500 字以內。`
          : `內容：${text}\n\n將以下內容轉換成一則吸引人的 Instagram/LinkedIn 貼文。${plainTextInstruction} 包含吸引人的開頭、有價值的內容主體和行動呼籲。適當使用表情符號。`;
        break;
      }
      default:
        return res.status(400).json({ error: '無效的 action' });
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userContent }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API Error:', error);
      return res.status(500).json({ error: 'AI 生成失敗' });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (action === 'social_caption') {
      const cleanText = (t) => t
        .replace(/\*\*/g, '')       // bold **
        .replace(/\*/g, '')         // italic *
        .replace(/^#+\s/gm, '')     // headings #
        .replace(/__/g, '')         // bold __
        .replace(/_/g, '')          // italic _
        .replace(/`/g, '')          // code `
        .replace(/~~(.*?)~~/g, '$1') // strikethrough
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links [text](url)
        .replace(/^>\s?/gm, '')     // blockquotes
        .replace(/^[-*+]\s/gm, '')  // list markers
        .replace(/^\d+\.\s/gm, '') // numbered lists
        .trim();
      if (isThreadMode) {
        const captions = content.split('|||').map((s) => cleanText(s)).filter((s) => s.length > 0);
        return res.json({ captions });
      }
      return res.json({ captions: [cleanText(content)] });
    }

    return res.json({ content });
  } catch (error) {
    console.error('Gemini Error:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
});

// ===== Static Files + SPA Fallback =====
app.use(express.static(path.join(__dirname, 'dist')));
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[AutoCard] Server running on port ${PORT}`);
});
