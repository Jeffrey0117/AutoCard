// Gemini Service - calls backend API (no API keys exposed)

import { AIServiceAction } from '../types';

export const generateAIContent = async (text: string, action: AIServiceAction): Promise<string> => {
  const actionMap: Record<AIServiceAction, string> = {
    [AIServiceAction.SUMMARIZE]: 'summarize',
    [AIServiceAction.IMPROVE]: 'improve',
    [AIServiceAction.FIX_GRAMMAR]: 'fix_grammar',
    [AIServiceAction.EXPAND]: 'expand',
    [AIServiceAction.MAKE_SOCIAL]: 'make_social',
  };

  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: actionMap[action],
      text
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '生成失敗');
  }

  const data = await response.json();
  return data.content;
};

export const generateFromTopic = async (topic: string): Promise<string> => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'from_topic',
      topic
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '生成失敗');
  }

  const data = await response.json();
  return data.content;
};

export const generateSocialCaptions = async (text: string, isThreadMode: boolean): Promise<string[]> => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'social_caption',
      text,
      isThreadMode
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '生成失敗');
  }

  const data = await response.json();
  return data.captions;
};
