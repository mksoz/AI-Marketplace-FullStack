import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

try {
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (error) {
  console.warn("Gemini API Key not found or invalid. Using mock responses.");
}

export const sendMessageToGemini = async (message: string, context?: string): Promise<string> => {
  if (!ai) {
    // Mock response if no API key
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Esto es una respuesta simulada porque no se detectó una API Key válida. 
        
He encontrado algunas empresas que podrían interesarte basadas en "${message}". 
Recomiendo revisar QuantumLeap Analytics por su experiencia en el sector.`);
      }, 1000);
    });
  }

  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = context 
      ? `You are a helpful AI assistant for a B2B platform connecting clients with AI development agencies. Context: ${context}`
      : `You are a helpful AI assistant for a B2B platform connecting clients with AI development agencies.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "Lo siento, no pude generar una respuesta en este momento.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Hubo un error al conectar con el asistente. Por favor intenta de nuevo.";
  }
};
