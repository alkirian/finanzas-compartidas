// Gemini AI Service for parsing voice commands with natural language

const GEMINI_API_KEY = 'AIzaSyC0HLb5VIaNDQ0j_YKNR0U-wnRgtaxwpZ4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `Eres un asistente financiero inteligente que entiende lenguaje natural en español.
Tu trabajo es extraer transacciones financieras de lo que dice el usuario.

REGLAS DE INTERPRETACIÓN:
- "cobré", "me pagaron", "recibí", "ingresé", "sueldo", "cobro" → INGRESO (income)
- "gasté", "pagué", "compré", "gasto", "comí", "almorcé", "cené" → GASTO (expense)
- Si no está claro, asume GASTO

El usuario puede mencionar UNA o VARIAS transacciones en la misma frase.

EJEMPLOS:
- "Cobré 200 de filmación" → 1 transacción: income, 200, Filmación
- "Gasté 50 en comida" → 1 transacción: expense, 50, Comida
- "Cobré 200 de filmación y gasté 50 en comida" → 2 transacciones
- "Me pagaron 30000 del sueldo" → 1 transacción: income, 30000, Sueldo
- "Almorcé por 800" → 1 transacción: expense, 800, Almuerzo
- "Compré nafta 1500 y pagué el estacionamiento 200" → 2 transacciones

RESPONDE SOLO con este JSON (sin markdown, sin explicación):
{
  "transactions": [
    {"type": "income o expense", "amount": NUMERO, "description": "texto corto"}
  ]
}

Si hay varias transacciones, agrégalas al array. Si no entiendes nada, devuelve: {"transactions": [], "error": "mensaje"}`;

export async function parseVoiceCommand(transcription) {
    console.log('🎤 Transcripción recibida:', transcription);

    if (!transcription || transcription.trim().length < 2) {
        return {
            action: 'error',
            message: 'No se escuchó nada. Intenta de nuevo.',
        };
    }

    try {
        console.log('🤖 Enviando a Gemini AI...');

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `${SYSTEM_PROMPT}\n\nEl usuario dijo: "${transcription}"` }],
                    },
                ],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 300,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', response.status, errorText);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('📥 Respuesta Gemini:', JSON.stringify(data, null, 2));

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('Sin respuesta de Gemini');
        }

        console.log('📝 Texto de Gemini:', text);

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('JSON no encontrado en respuesta');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Parseado:', parsed);

        // Check for errors from Gemini
        if (parsed.error) {
            return {
                action: 'error',
                message: parsed.error,
            };
        }

        // Check if we have transactions
        if (parsed.transactions && parsed.transactions.length > 0) {
            // Validate and clean transactions
            const validTransactions = parsed.transactions
                .filter(t => t.amount && t.amount > 0)
                .map(t => ({
                    type: t.type === 'income' ? 'income' : 'expense',
                    amount: Number(t.amount),
                    description: t.description || 'Transacción',
                }));

            if (validTransactions.length === 1) {
                // Single transaction
                return {
                    action: 'add_transaction',
                    ...validTransactions[0],
                };
            } else if (validTransactions.length > 1) {
                // Multiple transactions
                return {
                    action: 'add_multiple',
                    transactions: validTransactions,
                };
            }
        }

        // Fallback to simple parsing if Gemini didn't understand
        return parseWithKeywords(transcription);

    } catch (error) {
        console.error('⚠️ Error con Gemini:', error.message);
        // Fallback to local parsing
        const fallback = parseWithKeywords(transcription);
        if (fallback) {
            return fallback;
        }
        return {
            action: 'error',
            message: 'Intenta decir algo como "Gasté 500 en comida" o "Cobré 1000"',
        };
    }
}

// Simple local fallback parser
function parseWithKeywords(text) {
    const lowerText = text.toLowerCase().trim();

    const numbers = lowerText.match(/\d+(?:[.,]\d+)?/g);
    if (!numbers || numbers.length === 0) {
        return null;
    }

    const amount = parseFloat(numbers[0].replace(',', '.'));

    // Income keywords (including conjugations)
    const incomeKeywords = ['cobr', 'ingres', 'sueld', 'pagar', 'recib', 'transferen'];
    const isIncome = incomeKeywords.some(keyword => lowerText.includes(keyword));

    let description = lowerText
        .replace(/\d+(?:[.,]\d+)?/g, '')
        .replace(/gast|compr|pagu|cobr|ingres|sueld|recib|de|en|por|pesos|uyu|y/gi, '')
        .trim();

    if (!description || description.length < 2) {
        description = isIncome ? 'Ingreso' : 'Gasto';
    }

    description = description.charAt(0).toUpperCase() + description.slice(1);

    return {
        action: 'add_transaction',
        type: isIncome ? 'income' : 'expense',
        amount: amount,
        description: description,
    };
}
