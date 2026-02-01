import { GoogleGenAI } from "@google/genai";
import { AIServiceAction } from '../types';

const getSystemInstruction = (action: AIServiceAction): string => {
  switch (action) {
    case AIServiceAction.SUMMARIZE:
      return "You are an expert editor. Summarize the provided text concisely while retaining key points.";
    case AIServiceAction.IMPROVE:
      return "You are a professional copywriter. Rewrite the provided text to be more engaging, clear, and impactful. Maintain the original meaning but improve flow and vocabulary.";
    case AIServiceAction.FIX_GRAMMAR:
      return "You are a strict proofreader. Correct all grammar, spelling, and punctuation errors in the provided text. Do not change the style, only fix errors.";
    case AIServiceAction.EXPAND:
      return "You are a creative writer. Expand on the provided text, adding relevant details, examples, or depth to the ideas presented.";
    case AIServiceAction.MAKE_SOCIAL:
      return "You are a social media manager. Rewrite the text into a format suitable for Instagram or LinkedIn. Use emojis, short paragraphs, and a hook.";
    default:
      return "You are a helpful writing assistant.";
  }
};

export const generateAIContent = async (text: string, action: AIServiceAction): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction: getSystemInstruction(action),
        temperature: 0.7,
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateFromTopic = async (topic: string): Promise<string> => {
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing.");
    }
  
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a short, engaging article about: "${topic}". Use Markdown formatting. Include a title, subtitles, bullet points, and a quote.`,
        config: {
          systemInstruction: "You are a content creator specialized in viral, aesthetic blog posts.",
          temperature: 0.8,
        }
      });
  
      return response.text || "";
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
};

export const generateSocialCaptions = async (text: string, isThreadMode: boolean): Promise<string[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Explicitly request plain text to avoid markdown artifacts in captions
    const plainTextInstruction = "IMPORTANT: Return strictly PLAIN TEXT. Do NOT use Markdown formatting (no bold **, no italics *, no headers #). Just pure text with emojis.";

    const prompt = isThreadMode 
        ? `Convert the following content into a "Thread" style social media post series. 
           ${plainTextInstruction}
           Split the content into multiple coherent parts. 
           The first part should be a strong hook. 
           The last part should be a Call to Action. 
           Use "|||" as the separator between each part. 
           Do not add numbering like "1/" manually unless it helps flow. 
           Keep each part under 500 characters.`
        : `Convert the following content into a single, engaging Instagram/LinkedIn caption. 
           ${plainTextInstruction}
           Include a hook, value-add body, and a call to action. 
           Use emojis appropriately.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Content: ${text}\n\n${prompt}`,
            config: {
                systemInstruction: "You are a viral social media expert. You output clean, plain text.",
                temperature: 0.7,
            }
        });

        const rawText = response.text || "";
        
        // Helper to strip any lingering markdown just in case
        const cleanText = (t: string) => t.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^#+\s/gm, '').trim();

        if (isThreadMode) {
            return rawText.split('|||').map(s => cleanText(s)).filter(s => s.length > 0);
        } else {
            return [cleanText(rawText)];
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}