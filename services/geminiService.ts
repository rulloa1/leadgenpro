
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { BusinessLead } from "../types";

const API_KEY = process.env.API_KEY;

export const searchLeads = async (query: string, location?: { latitude: number; longitude: number }): Promise<BusinessLead[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY! });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Find 5 ${query} businesses. For each, identify a potential digital gap and analyze how long they have been in business based on their history or reputation (e.g., "Established 15+ years", "Since 2012", "Relatively New"). 
    Also, suggest 3 highly relevant digital services (e.g., "Google Ads Management", "AI Appointment Setter", "Mobile Web Optimization") that would specifically fix their gap.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: location ? {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        } : undefined
      }
    },
  });

  const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const structurer = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on this search result: "${response.text}", list exactly 5 businesses in JSON format.
    Schema: Array<{ name: string, industry: string, city: string, website: string, gap: string, yearsInBusiness: string, recommendedServices: string[] }>
    Search context: ${query}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            industry: { type: Type.STRING },
            city: { type: Type.STRING },
            website: { type: Type.STRING },
            gap: { type: Type.STRING },
            yearsInBusiness: { type: Type.STRING, description: "Analysis of how long they've been operating" },
            recommendedServices: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 3 specific services to offer them" 
            },
          },
          required: ["name", "industry", "city", "website", "gap", "yearsInBusiness", "recommendedServices"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(structurer.text);
    return data.map((item: any, index: number) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      rating: 3.5 + Math.random() * 1.5,
      mapsUrl: grounding[index]?.maps?.uri || ''
    }));
  } catch (e) {
    console.error("Failed to parse leads JSON", e);
    return [];
  }
};

export const generatePersonalizedHook = async (lead: BusinessLead): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY! });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a one-sentence personalized cold email hook for ${lead.name} (${lead.industry} in ${lead.city}).
    Mention their gap: "${lead.gap}" and acknowledge their longevity: "${lead.yearsInBusiness}". 
    Make it sound human, neighborly, and respectful of their hard-earned reputation.`,
  });
  return response.text || "I noticed your website might need some updates to better attract local customers.";
};
