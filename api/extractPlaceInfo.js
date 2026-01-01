import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "Missing 'url' in body" });

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
  const model = process.env.AI_MODEL || "claude-haiku-4.5";

  const prompt = `Lakukan pencarian Google (Search Grounding) untuk mendapatkan informasi paling akurat dari link Google Maps ini: ${url}.

Ekstrak data dengan detail berikut:
1. Nama tempat yang resmi dan benar.
2. Alamat fisik lengkap.
3. Deskripsi singkat (1-2 kalimat) yang menjelaskan daya tarik utama tempat ini.
4. Rating bintang terbaru (dalam angka 1-5).
5. Minimal 3 tags relevan (misal: "Instagrammable", "Kopi Enak", "Pemandangan Alam").
6. Kategori yang paling pas: Restaurant, Cafe, Sightseeing, Hotel, Shopping, Activity, atau Other.

Pastikan output dalam format JSON murni.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            address: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            rating: { type: Type.NUMBER }
          },
          required: ["name", "category", "address", "description", "tags"]
        }
      }
    });

    const text = response?.text;
    if (!text) return res.status(502).json({ error: "Empty response from AI" });

    // Return AI JSON directly
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(text);
  } catch (err) {
    res.status(500).json({ error: err?.message || String(err) });
  }
}
