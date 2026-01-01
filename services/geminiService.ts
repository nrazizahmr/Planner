
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiPlaceInfo, PlaceCategory } from "../types";

export const extractPlaceInfo = async (url: string): Promise<GeminiPlaceInfo> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const prompt = `Lakukan pencarian Google (Search Grounding) untuk mendapatkan informasi paling akurat dari link Google Maps ini: ${url}.
  
  Ekstrak data dengan detail berikut:
  1. Nama tempat yang resmi dan benar.
  2. Alamat fisik lengkap.
  3. Deskripsi singkat (1-2 kalimat) yang menjelaskan daya tarik utama tempat ini.
  4. Rating bintang terbaru (dalam angka 1-5).
  5. Minimal 3 tags relevan (misal: "Instagrammable", "Kopi Enak", "Pemandangan Alam").
  6. Kategori yang paling pas: Restaurant, Cafe, Sightseeing, Hotel, Shopping, Activity, atau Other.

  Pastikan output dalam format JSON murni.`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING, enum: Object.values(PlaceCategory) },
          address: { type: Type.STRING },
          description: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          rating: { type: Type.NUMBER }
        },
        required: ["name", "category", "address", "description", "tags"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Gagal mengekstrak informasi. Pastikan link Google Maps valid.");
  
  return JSON.parse(text) as GeminiPlaceInfo;
};
