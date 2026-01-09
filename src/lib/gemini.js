// Gemini AI Service for parsing voice commands

const GEMINI_API_KEY = 'AIzaSyC0HLb5VIaNDQ0j_YKNR0U-wnRgtaxwpZ4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `Parsea este comando de voz en español para una app de finanzas.
Extrae: tipo (income/expense), monto (número), descripción (texto corto).
Responde SOLO con JSON: {"action":"add_transaction","type":"income o expense","amount":NUMERO,"description":"texto"}`;

// Simple local fallback parser using keywords
function parseWithKeywords(text) {
    const lowerText = text.toLowerCase().trim();

    // Find numbers in the text
    const numbers = lowerText.match(/\d+(?:[.,]\d+)?/g);
    if (!numbers || numbers.length === 0) {
        return null;
    }

    const amount = parseFloat(numbers[0].replace(',', '.'));

    // Income keywords
    const incomeKeywords = ['cobro', 'cobré', 'ingreso', 'sueldo', 'pagaron', 'recibí', 'transferencia', 'pago recibido'];
    const isIncome = incomeKeywords.some(keyword => lowerText.includes(keyword));

    // Get description - remove numbers and keywords
    let description = lowerText
        .replace(/\d+(?:[.,]\d+)?/g, '')
        .replace(/gasto|gasté|compré|pagué|cobro|cobré|ingreso|sueldo|de|en|por|pesos|uyu/gi, '')
        .trim();

    if (!description || description.length < 2) {
        description = isIncome ? 'Ingreso' : 'Gasto';
    }

    // Capitalize first letter
    description = description.charAt(0).toUpperCase() + description.slice(1);

    return {
        action: 'add_transaction',
        type: isIncome ? 'income' : 'expense',
        amount: amount,
        description: description,
    };
}

export async function parseVoiceCommand(transcription) {
    console.log('🎤 Transcripción recibida:', transcription);

    if (!transcription || transcription.trim().length < 2) {
        return {
            action: 'error',
            message: 'No se escuchó nada. Intenta de nuevo.',
        };
    }

    // First try local parsing (fast and reliable)
    const localResult = parseWithKeywords(transcription);

    if (localResult && localResult.amount > 0) {
        console.log('✅ Parseado localmente:', localResult);
        return localResult;
    }

    // If local parsing failed, try Gemini API
    try {
        console.log('🤖 Intentando con Gemini API...');

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `${SYSTEM_PROMPT}\n\nComando: "${transcription}"` }],
                    },
                ],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 100,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            const jsonMatch = text.match(/\{[^{}]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.action === 'add_transaction' && parsed.amount) {
                    console.log('✅ Parseado con Gemini:', parsed);
                    return {
                        action: 'add_transaction',
                        type: parsed.type || 'expense',
                        amount: Number(parsed.amount),
                        description: parsed.description || 'Transacción',
                    };
                }
            }
        }
    } catch (error) {
        console.error('⚠️ Gemini API falló:', error.message);
    }

    // If everything failed
    return {
        action: 'error',
        message: 'Di algo como "Gasto 500 supermercado" o "Cobro 30000 sueldo"',
    };
}
