// Gemini AI Service for parsing voice commands

const GEMINI_API_KEY = 'AIzaSyC0HLb5VIaNDQ0j_YKNR0U-wnRgtaxwpZ4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `Eres un asistente financiero que parsea comandos de voz en español para una app de finanzas personales.

El usuario puede decir cosas como:
- "Gasto de 500 en supermercado"
- "Ingreso de 50000 por sueldo"
- "Ayer gasté 2000 en nafta"
- "Me pagaron 30000"
- "Compré ropa por 1500"

Tu trabajo es extraer la información y devolver SOLO un JSON con este formato exacto:
{
  "action": "add_transaction",
  "type": "income" | "expense",
  "amount": number,
  "description": "string"
}

Reglas:
- Si el usuario habla de gastar, comprar, pagar algo = type: "expense"
- Si el usuario habla de recibir, cobrar, le pagaron, ingreso, sueldo = type: "income"
- Extrae el monto como número (sin símbolos de moneda)
- La descripción debe ser corta y clara
- Si no puedes entender el comando, devuelve: {"action": "unknown", "message": "explicación corta"}

IMPORTANTE: Responde SOLO con el JSON, sin explicaciones ni markdown.`;

export async function parseVoiceCommand(transcription) {
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `${SYSTEM_PROMPT}\n\nComando del usuario: "${transcription}"` }],
                    },
                ],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 200,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No response from Gemini');
        }

        // Parse the JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid JSON response');
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Error parsing voice command:', error);
        return {
            action: 'error',
            message: 'No pude entender el comando. Intenta de nuevo.',
        };
    }
}
