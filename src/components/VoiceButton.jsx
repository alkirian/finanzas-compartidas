import { useState, useRef, useEffect } from 'react';
import { parseVoiceCommand } from '../lib/gemini';

export default function VoiceButton({ onCommand, onError, onStatusChange }) {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('');
            onStatusChange?.('Escuchando...');
        };

        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const result = event.results[current];
            const text = result[0].transcript;
            setTranscript(text);

            if (result.isFinal) {
                handleFinalTranscript(text);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            setIsProcessing(false);

            if (event.error === 'no-speech') {
                onError?.('No escuché nada. Intenta de nuevo.');
            } else if (event.error === 'not-allowed') {
                onError?.('Permiso de micrófono denegado.');
            } else {
                onError?.('Error al escuchar. Intenta de nuevo.');
            }
            onStatusChange?.(null);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.abort();
        };
    }, []);

    const handleFinalTranscript = async (text) => {
        setIsListening(false);
        setIsProcessing(true);
        onStatusChange?.('Procesando con IA...');

        try {
            const result = await parseVoiceCommand(text);
            console.log('📦 Resultado del parser:', result);

            // Pass the entire result to the parent - it handles single/multiple
            if (result.action === 'add_transaction' || result.action === 'add_multiple') {
                onCommand?.(result);
            } else if (result.action === 'error') {
                onError?.(result.message);
            }
            onStatusChange?.(null);
        } catch (error) {
            console.error('Error processing command:', error);
            onError?.('Error procesando el comando.');
            onStatusChange?.(null);
        } finally {
            setIsProcessing(false);
            setTranscript('');
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            onError?.('Tu navegador no soporta reconocimiento de voz.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error('Error starting recognition:', error);
            }
        }
    };

    const isActive = isListening || isProcessing;

    return (
        <div className="voice-button-container">
            <button
                className={`voice-button ${isActive ? 'active' : ''} ${isProcessing ? 'processing' : ''}`}
                onClick={toggleListening}
                disabled={isProcessing}
                aria-label={isListening ? 'Detener grabación' : 'Iniciar comando de voz'}
            >
                {isProcessing ? (
                    <div className="voice-spinner" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                )}
            </button>

            {transcript && (
                <div className="voice-transcript">
                    "{transcript}"
                </div>
            )}
        </div>
    );
}
