
// @google/genai guidelines followed: use new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
import { GoogleGenAI } from "@google/genai";

export const handler = async (event: any) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Ensure API key is present
  if (!process.env.GEMINI_API_KEY) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Server configuration error: API Key missing." }) 
    };
  }

  try {
    const { topicName, industryName } = JSON.parse(event.body);

    // Initializing with the recommended pattern from guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
      You are a sustainability expert specializing in IFRS S1 and SASB standards.
      Write a concise, professional risk description for the following topic:
      
      Topic: ${topicName}
      Industry: ${industryName}
      Context: financial materiality
      
      Focus on how this topic could impact enterprise value (Cash flow, Cost of Capital, or Access to Finance).
      Keep it under 3 sentences.
    `;

    // Always use ai.models.generateContent directly with model name
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      // Accessing .text property directly as per guidelines
      body: JSON.stringify({ text: response.text?.trim() || "No suggestion generated." }),
    };
  } catch (error: any) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate narrative." }),
    };
  }
};
