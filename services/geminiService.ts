
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, WordPair } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const fetchWordPairs = async (difficulty: Difficulty, count: number = 8): Promise<WordPair[]> => {
  const prompt = `Generate ${count} English-Chinese word pairs for a matching game. 
  Difficulty level: ${difficulty}. 
  Provide commonly used words. Ensure the translations are accurate and concise. 
  Include a short sentence or additional explanation for each word.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              en: { type: Type.STRING },
              zh: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["id", "en", "zh", "explanation"]
          }
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Error fetching words from Gemini:", error);
    // Fallback static data if API fails
    return Array.from({ length: count }).map((_, i) => ({
      id: `fallback-${i}`,
      en: ["Apple", "Banana", "Computer", "Science", "Nature", "Library", "Pencil", "Mountain"][i % 8],
      zh: ["苹果", "香蕉", "电脑", "科学", "自然", "图书馆", "铅笔", "山脉"][i % 8],
      explanation: "A common word."
    }));
  }
};
