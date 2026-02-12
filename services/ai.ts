/**
 * AI 服務 - 透過後端 API 呼叫（API keys 不會暴露在前端）
 */

import { getAuthHeaders } from './auth';

export interface GenerateOptions {
  topic: string;
  style?: 'tutorial' | 'story' | 'list' | 'opinion';
  pages?: number;
}

export async function generateContent(options: GenerateOptions): Promise<string> {
  const { topic, pages = 4 } = options;

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ topic, pages }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '生成失敗');
  }

  const data = await response.json();
  return data.content;
}
