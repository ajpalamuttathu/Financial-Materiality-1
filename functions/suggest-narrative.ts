
import { GoogleGenAI } from "@google/genai";

export const handler = async (event: any) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Server configuration error: API Key missing." }) 
    };
  }

  try {
    const { topicName, industryName } = JSON.parse(event.body);

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      You are a sustainability expert specializing in IFRS S1 and SASB standards.
      Write a concise, professional risk description for the following topic:
      
      Topic: ${topicName}
      Industry: ${industryName}
      Context: financial materiality
      
      Focus on how this topic could impact enterprise value (Cash flow, Cost of Capital, or Access to Finance).
      Keep it under 3 sentences.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
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
