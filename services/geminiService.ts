
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { BusinessLead } from "../types";

const API_KEY = process.env.API_KEY;

export const searchLeads = async (
  query: string, 
  location?: { latitude: number; longitude: number }, 
  mode: 'growth' | 'distressed' = 'growth',
  scope: 'bulk' | 'single' = 'bulk'
): Promise<BusinessLead[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY! });
  
  let promptContext = "";
  
  if (scope === 'single') {
    // Single Business Audit Logic
    if (mode === 'distressed') {
      promptContext = `Analyze the specific business "${query}". Act as a ruthless digital auditor. 
      Identify 3 critical failures in their digital presence (e.g. website speed, bad reviews, lack of social, poor SEO).
      The 'gap' field should be the most glaring weakness found.
      The 'yearsInBusiness' should be estimated based on their history.
      Suggest 3 repair-focused services to pitch them immediately.`;
    } else {
      promptContext = `Analyze the specific business "${query}". Act as a high-end growth consultant.
      Identify their "Digital Ceiling" - what is stopping them from scaling further? (e.g. lack of automation, poor ad funnel, no AI integration).
      The 'gap' field should be this growth bottleneck.
      The 'yearsInBusiness' should be estimated.
      Suggest 3 high-ticket growth/optimization services.`;
    }
  } else {
    // Bulk Market Scan Logic
    if (mode === 'distressed') {
      promptContext = `Find 5 ${query} businesses that specifically have a POOR digital presence. Look for ratings under 4.0, missing websites, or businesses that look outdated. 
      For each, identify the specific "Digital Failure" (e.g. "No website", "Bad reviews", "Non-responsive"). 
      The 'yearsInBusiness' should emphasize if they are established but neglecting digital (e.g. "20+ years, stuck in past").
      Suggest 3 'Monthly Marketing Packages' (e.g. "Reputation Repair", "Website Rebuild", "Local SEO Fix").`;
    } else {
      promptContext = `Find 5 ${query} businesses. For each, identify a potential digital gap and analyze how long they have been in business based on their history or reputation (e.g., "Established 15+ years", "Since 2012", "Relatively New"). 
      Also, suggest 3 highly relevant digital services (e.g., "Google Ads Management", "AI Appointment Setter", "Mobile Web Optimization") that would specifically fix their gap.`;
    }
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${promptContext}
    IMPORTANT: Capture the specific address, extract the approximate latitude/longitude, and try to find a public contact email (e.g. info@domain.com) if available.`,
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
    contents: `Based on this search result: "${response.text}", list exactly ${scope === 'single' ? '1 business' : '5 businesses'} in JSON format.
    Schema: Array<{ name: string, industry: string, city: string, website: string, email: string, gap: string, yearsInBusiness: string, recommendedServices: string[], address: string, latitude: number, longitude: number }>
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
            email: { type: Type.STRING, description: "The public email address found, or a likely placeholder like info@domain.com" },
            gap: { type: Type.STRING },
            yearsInBusiness: { type: Type.STRING, description: "Analysis of how long they've been operating" },
            recommendedServices: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 3 specific services to offer them" 
            },
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
    const data = JSON.parse(structurer.text);
    return data.map((item: any, index: number) => {
      // Fallback logic for email if the model returns 'null' string or empty
      let finalEmail = item.email;
      if (!finalEmail || finalEmail === 'null' || !finalEmail.includes('@')) {
        const domain = item.website ? item.website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0] : 'gmail.com';
        finalEmail = `info@${domain}`;
      }

      return {
        ...item,
        email: finalEmail,
        id: Math.random().toString(36).substr(2, 9),
        rating: mode === 'distressed' ? (2.0 + Math.random() * 2.0) : (3.5 + Math.random() * 1.5),
        mapsUrl: grounding[index]?.maps?.uri || ''
      };
    });
  } catch (e) {
    console.error("Failed to parse leads JSON", e);
    return [];
  }
};

export const generateTailoredEmail = async (lead: BusinessLead): Promise<{ hook: string, subject: string, body: string }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY! });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a high-converting cold email for ${lead.name} (${lead.industry} in ${lead.city}).
    Context:
    - Their identified gap is: "${lead.gap}"
    - They have been in business: "${lead.yearsInBusiness}"
    
    Instructions:
    1. "subject": Short, lowercase, casual (e.g. "question about [domain]" or "quick question").
    2. "hook": The first sentence/paragraph. Must be a specific observation about their ${lead.gap} or reputation. NO FLUFF.
    3. "body": The full email script. It should Start with the hook, then explain the implication of the gap (the problem), then offer a specific value-add or fix (the solution), then a soft CTA (e.g. "Mind if I send a video?"). Keep it under 150 words.
    
    Return ONLY JSON. Schema: { "subject": string, "hook": string, "body": string }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            subject: { type: Type.STRING },
            hook: { type: Type.STRING },
            body: { type: Type.STRING }
        },
        required: ["subject", "hook", "body"]
      }
    }
  });
  
  return JSON.parse(response.text);
};
