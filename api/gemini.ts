// Vercel Serverless Function - Gemini AI
// API keys are only accessible server-side (no VITE_ prefix)

import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允許 POST 請求' });
  }

  const { action, text, topic, isThreadMode } = req.body;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API Key 未設定' });
  }

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
      case 'social_caption':
        systemInstruction = '你是病毒式社群媒體專家。你輸出乾淨的純文字。使用繁體中文。';
        const plainTextInstruction = '重要：只回傳純文字。不要使用 Markdown 格式（不要用粗體 **、斜體 *、標題 #）。只用純文字加上表情符號。使用繁體中文。';
        userContent = isThreadMode
          ? `內容：${text}\n\n將以下內容轉換成「串文」風格的社群媒體貼文系列。${plainTextInstruction} 將內容分成多個連貫的部分。第一部分要是強力的開頭吸引注意。最後一部分要是行動呼籲。使用 "|||" 作為每部分的分隔符。每部分保持在 500 字以內。`
          : `內容：${text}\n\n將以下內容轉換成一則吸引人的 Instagram/LinkedIn 貼文。${plainTextInstruction} 包含吸引人的開頭、有價值的內容主體和行動呼籲。適當使用表情符號。`;
        break;
      default:
        return res.status(400).json({ error: '無效的 action' });
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: userContent }]
        }],
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API Error:', error);
      return res.status(500).json({ error: 'AI 生成失敗' });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // For social_caption with thread mode, split by |||
    if (action === 'social_caption') {
      const cleanText = (t: string) => t.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^#+\s/gm, '').trim();
      if (isThreadMode) {
        const captions = content.split('|||').map((s: string) => cleanText(s)).filter((s: string) => s.length > 0);
        return res.status(200).json({ captions });
      } else {
        return res.status(200).json({ captions: [cleanText(content)] });
      }
    }

    return res.status(200).json({ content });
  } catch (error) {
    console.error('Gemini Error:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}
