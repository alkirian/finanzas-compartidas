// Gemini AI Service for parsing voice commands

const GEMINI_API_KEY = 'AIzaSyC0HLb5VIaNDQ0j_YKNR0U-wnRgtaxwpZ4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `Eres un asistente financiero amigable que ayuda a registrar gastos e ingresos. Tu trabajo es interpretar lo que dice el usuario y extraer la información financiera.

EJEMPLOS de lo que el usuario puede decir:
- "Gasto de 500 en supermercado" → expense, 500, supermercado
- "Gasté 2000 en nafta" → expense, 2000, nafta
- "Compré ropa por 1500" → expense, 1500, ropa
- "Me pagaron 30000" → income, 30000, pago recibido
- "Ingreso 50000 sueldo" → income, 50000, sueldo
- "Cobré 10000" → income, 10000, cobro
- "500 café" → expense, 500, café
- "Almuerzo 800" → expense, 800, almuerzo
- "Sueldo 45000" → income, 45000, sueldo

REGLAS:
1. Si menciona: gastar, comprar, pagar, almuerzo, café, nafta, super, comida, etc → type: "expense"
2. Si menciona: cobrar, sueldo, ingreso, pago, transferencia recibida, me pagaron → type: "income"
3. Si solo hay un número y una palabra, asume que es un GASTO
4. El monto SIEMPRE debe ser un número positivo
5. Si no hay descripción clara, inventa una corta basada en el contexto

RESPONDE SOLO con este JSON exacto (sin markdown, sin explicación):
{"action":"add_transaction","type":"income o expense","amount":NUMERO,"description":"texto corto"}`;

export async function parseVoiceCommand(transcription) {
    console.log('🎤 Transcripción recibida:', transcription);

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
                        parts: [{ text: `${SYSTEM_PROMPT}\n\nEl usuario dijo: "${transcription}"\n\nResponde SOLO con el JSON:` }],
                    },
                ],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 150,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Gemini API error:', response.status, errorText);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('🤖 Gemini response:', JSON.stringify(data, null, 2));

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error('❌ No text in response');
            throw new Error('No response from Gemini');
        }

        console.log('📝 Gemini text:', text);

        // Parse the JSON response - more flexible regex
        const jsonMatch = text.match(/\{[^{}]*\}/);
        if (!jsonMatch) {
            console.error('❌ No JSON found in:', text);
            throw new Error('Invalid JSON response');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Parsed result:', parsed);

        // Validate the response
        if (parsed.action === 'add_transaction' && parsed.amount && parsed.type) {
            return {
                action: 'add_transaction',
                type: parsed.type,
                amount: Number(parsed.amount),
                description: parsed.description || 'Transacción por voz',
            };
        }

        return parsed;
    } catch (error) {
        console.error('❌ Error parsing voice command:', error);
        return {
            action: 'error',
            message: `Error: ${error.message}. Intenta decir algo como "Gasto de 500 en supermercado"`,
        };
    }
}
