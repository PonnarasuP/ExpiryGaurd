import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ExtractedWarranty {
  name: string;
  category: 'electronics' | 'medicine' | 'food' | 'cosmetics';
  expiryDate: string; // YYYY-MM-DD
  purchaseDate?: string; // YYYY-MM-DD
}

export async function scanReceipt(base64Image: string): Promise<ExtractedWarranty | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Extract the product name, category (electronics, medicine, food, or cosmetics), and the warranty/expiry date from this receipt or product image. If it's a warranty, calculate the end date if only purchase date and duration are given. Return the data in JSON format." },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(',')[1] || base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { 
              type: Type.STRING, 
              enum: ["electronics", "medicine", "food", "cosmetics"] 
            },
            expiryDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
            purchaseDate: { type: Type.STRING, description: "YYYY-MM-DD format" }
          },
          required: ["name", "category", "expiryDate"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as ExtractedWarranty;
  } catch (error) {
    console.error("Error scanning receipt:", error);
    return null;
  }
}
