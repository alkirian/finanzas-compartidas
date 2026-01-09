import { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/storage';

export default function EditTransaction({ transaction, onSave, onDelete, onClose }) {
    const [type, setType] = useState(transaction.type);
    const [description, setDescription] = useState(transaction.description);
    const [amount, setAmount] = useState(String(transaction.amount));
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description.trim() || !amount) return;

        onSave({
            ...transaction,
            type,
            description: description.trim(),
            amount: parseFloat(amount),
        });
        onClose();
    };

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setAmount(value);
    };

    const handleDelete = () => {
        onDelete(transaction.id);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Editar Movimiento</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {!showDeleteConfirm ? (
                    <form className="form" onSubmit={handleSubmit}>
                        {/* Type selector */}
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
                                placeholder="Ej: Supermercado, Sueldo..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Action buttons */}
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!description.trim() || !amount}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Guardar Cambios
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setShowDeleteConfirm(true)}
                            style={{ borderColor: 'var(--color-expense)', color: 'var(--color-expense)' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Eliminar
                        </button>
                    </form>
                ) : (
                    <div className="form">
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-expense)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>¿Eliminar este movimiento?</h3>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)' }}>
                                {description} - {formatCurrency(parseFloat(amount) || 0)}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn btn-expense"
                                onClick={handleDelete}
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
