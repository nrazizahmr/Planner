
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiPlaceInfo, PlaceCategory } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const extractPlaceInfo = async (url: string): Promise<GeminiPlaceInfo> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Extract detailed travel place information from this URL: ${url}. 
  If the URL is a Google Maps link, use your knowledge of that location. 
  If it's a general travel link, summarize the key destination.
  
  Important: Categorize the place into one of these: Restaurant, Cafe, Sightseeing, Hotel, Shopping, Activity, or Other.`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the place" },
          category: { 
            type: Type.STRING, 
            enum: Object.values(PlaceCategory),
            description: "Category of the place" 
          },
          address: { type: Type.STRING, description: "Physical address or location description" },
          description: { type: Type.STRING, description: "A concise 1-2 sentence description" },
          tags: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of 3-5 keywords or tags" 
          },
          rating: { type: Type.NUMBER, description: "The rating out of 5, if available" }
        },
        required: ["name", "category", "address", "description", "tags"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No information found for this URL.");
  
  return JSON.parse(text) as GeminiPlaceInfo;
};
