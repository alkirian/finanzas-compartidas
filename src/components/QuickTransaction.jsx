import { useState, useRef, useEffect } from 'react';
import { formatCurrency } from '../lib/storage';
import { hapticFeedback } from '../lib/mobileUX';

export default function QuickTransaction({ onSave, onClose, preselectedType }) {
    const [type, setType] = useState(preselectedType || 'expense');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    // Determine title based on preselected type
    const isPreselected = !!preselectedType;
    const title = isPreselected
        ? (type === 'income' ? 'Nuevo Ingreso' : 'Nuevo Gasto')
        : 'Nuevo Movimiento';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description.trim() || !amount) return;

        // Haptic feedback on success
        hapticFeedback('success');

        onSave({
            type,
            description: description.trim(),
            amount: parseFloat(amount),
        });

        setDescription('');
        setAmount('');
        onClose();
    };

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setAmount(value);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    {/* Type selector - only show if no preselection */}
                    {!isPreselected && (
                        <div className="tabs">
                            <button
                                type="button"
                                className={`tab expense ${type === 'expense' ? 'active' : ''}`}
                                onClick={() => setType('expense')}
                            >
                                Gasto
                            </button>
                            <button
                                type="button"
                                className={`tab income ${type === 'income' ? 'active' : ''}`}
                                onClick={() => setType('income')}
                            >
                                Ingreso
                            </button>
                        </div>
                    )}

                    {/* Amount */}
                    <div className="input-group">
                        <label>Monto (UYU)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            className="input input-money"
                            placeholder="0"
                            value={amount}
                            onChange={handleAmountChange}
                            autoFocus
                        />
                        {amount && (
                            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                {formatCurrency(parseFloat(amount) || 0)}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="input-group">
                        <label>Descripción</label>
                        <input
                            type="text"
                            className="input"
                            placeholder={type === 'income' ? 'Ej: Sueldo, Venta...' : 'Ej: Supermercado, Nafta...'}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className={`btn ${type === 'income' ? 'btn-income' : 'btn-expense'}`}
                        disabled={!description.trim() || !amount}
                    >
                        {type === 'income' ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="19" x2="12" y2="5"></line>
                                    <polyline points="5 12 12 5 19 12"></polyline>
                                </svg>
                                Guardar Ingreso
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <polyline points="19 12 12 19 5 12"></polyline>
                                </svg>
                                Guardar Gasto
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
