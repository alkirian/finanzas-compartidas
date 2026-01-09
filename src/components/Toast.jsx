import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 2500 }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = type === 'success'
        ? 'var(--color-income)'
        : type === 'error'
            ? 'var(--color-expense)'
            : 'var(--color-primary)';

    return (
        <div
            className="toast"
            style={{
                position: 'fixed',
                bottom: 'calc(100px + env(safe-area-inset-bottom))',
                left: '50%',
                transform: 'translateX(-50%)',
                background: bgColor,
                color: 'white',
                padding: '12px 24px',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 300,
                animation: 'toastIn 0.3s ease, toastOut 0.3s ease forwards',
                animationDelay: '0s, 2.2s',
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            }}
        >
            {type === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            )}
            {message}
            <style>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes toastOut {
          from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          to {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
        }
      `}</style>
        </div>
    );
}
