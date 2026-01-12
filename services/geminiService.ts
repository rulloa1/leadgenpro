
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { BusinessLead } from "../types";

const API_KEY = process.env.API_KEY;

/**
 * Utility to extract JSON string from AI response which might contain markdown blocks or preamble.
 */
function extractJson(text: string): string {
  // Try to find an array or object pattern
  const match = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  if (match) {
    return match[0];
  }
  return text.replace(/```json|```/g, "").trim();
}

export const searchLeads = async (
  query: string, 
  location?: { latitude: number; longitude: number }, 
  mode: 'growth' | 'distressed' = 'growth',
  scope: 'bulk' | 'single' = 'bulk'
): Promise<BusinessLead[]> => {
  if (!API_KEY) throw new Error("API Key is missing. Please ensure process.env.API_KEY is configured.");
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  let promptContext = "";
  if (scope === 'single') {
    if (mode === 'distressed') {
      promptContext = `Identify specific weaknesses for "${query}". Focus on digital failures like slow loading, poor mobile UX, or bad reviews. Return a detailed analysis of their current gaps.`;
    } else {
      promptContext = `Analyze growth opportunities for "${query}". Look for missing high-ticket features like AI automation, advanced SEO, or conversion funnels.`;
    }
  } else {
    if (mode === 'distressed') {
      promptContext = `Find 5 local ${query} businesses with POOR online presence (ratings < 4.0, no website, or outdated tech).`;
    } else {
      promptContext = `Find 5 local ${query} businesses that are successful but could scale further with better digital marketing or AI automation.`;
    }
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${promptContext} Provide name, industry, website, and a specific digital 'gap' for each. 
    IMPORTANT: You must return a descriptive text summary of the results so I can process them.`,
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
    contents: `Based on this raw data: "${response.text}", extract exactly ${scope === 'single' ? '1 business' : '5 businesses'} into the following JSON format.
    Search Context: ${query}
    
    Schema: Array<{ name: string, industry: string, city: string, website: string, email: string, gap: string, yearsInBusiness: string, recommendedServices: string[], address: string, latitude: number, longitude: number }>
    
    If data is missing, provide a logical estimation based on the business type.`,
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
            email: { type: Type.STRING },
            gap: { type: Type.STRING },
            yearsInBusiness: { type: Type.STRING },
            recommendedServices: { type: Type.ARRAY, items: { type: Type.STRING } },
            address: { type: Type.STRING },
            latitude: { type: Type.NUMBER },
            longitude: { type: Type.NUMBER },
          },
          required: ["name", "industry", "city", "website", "gap", "yearsInBusiness", "recommendedServices"]
        }
      }
    }
  });

  try {
    const rawJson = extractJson(structurer.text || "[]");
    const data = JSON.parse(rawJson);
    return data.map((item: any, index: number) => {
      let finalEmail = item.email;
      if (!finalEmail || finalEmail === 'null' || !finalEmail.includes('@')) {
        const domain = item.website ? item.website.replace(/https?:\/\/(www\.)?/, '').split('/')[0] : 'contact.com';
        finalEmail = `info@${domain}`;
      }

      return {
        ...item,
        email: finalEmail,
        id: Math.random().toString(36).substr(2, 9),
        rating: mode === 'distressed' ? (2.5 + Math.random() * 1.5) : (3.8 + Math.random() * 1.2),
        mapsUrl: grounding[index]?.maps?.uri || `https://www.google.com/maps/search/${encodeURIComponent(item.name + ' ' + item.city)}`
      };
    });
  } catch (e) {
    console.error("Failed to parse leads JSON. Raw output was:", structurer.text);
    return [];
  }
};

export const analyzeCompetitorUrl = async (url: string): Promise<BusinessLead> => {
  if (!API_KEY) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const searchResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze ${url}. Identify business name, industry, and location. Look for technical flaws like slow speed, poor SEO, or old tech stack.`,
    config: { tools: [{ googleSearch: {} }] }
  });

  const analysisResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on this research: "${searchResponse.text}", provide a technical audit for ${url} in JSON.
    Include scores (0-100) for mobileScore, seoScore, and speedScore. List criticalIssues and techStack.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          industry: { type: Type.STRING },
          city: { type: Type.STRING },
          gap: { type: Type.STRING },
          yearsInBusiness: { type: Type.STRING },
          recommendedServices: { type: Type.ARRAY, items: { type: Type.STRING } },
          analysisReport: {
            type: Type.OBJECT,
            properties: {
              mobileScore: { type: Type.NUMBER },
              seoScore: { type: Type.NUMBER },
              speedScore: { type: Type.NUMBER },
              techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
              criticalIssues: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        },
        required: ["name", "industry", "city", "gap", "analysisReport"]
      }
    }
  });

  const data = JSON.parse(extractJson(analysisResponse.text || "{}"));

  return {
    ...data,
    website: url,
    id: Math.random().toString(36).substr(2, 9),
    rating: 0,
    address: 'N/A',
    latitude: 0,
    longitude: 0,
    personalizedHook: `I noticed some technical vulnerabilities on ${url}, specifically with ${data.analysisReport.criticalIssues[0] || 'your mobile optimization'}.`
  };
};

export const generateTailoredEmail = async (lead: BusinessLead): Promise<{ hook: string, subject: string, body: string }> => {
  if (!API_KEY) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a cold email for ${lead.name}. Gap: ${lead.gap}. Duration: ${lead.yearsInBusiness}. 
    Format: { "subject": string, "hook": string, "body": string }. Keep it casual and short.`,
    config: { responseMimeType: "application/json" }
  });
  
  return JSON.parse(extractJson(response.text || "{}"));
};
