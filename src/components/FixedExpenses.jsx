import { useState } from 'react';
import { formatCurrency } from '../lib/storage';

export default function FixedExpenses({ expenses, onAdd, onDelete }) {
    const [showForm, setShowForm] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description.trim() || !amount) return;

        onAdd({
            description: description.trim(),
            amount: parseFloat(amount),
        });

        setDescription('');
        setAmount('');
        setShowForm(false);
    };

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setAmount(value);
    };

    const totalFixed = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="page">
            <div className="container">
                <div className="header">
                    <div className="page-header">
                        <h1 className="header-title">📌 Gastos Fijos</h1>
                    </div>
                </div>

                {/* Total fixed */}
                <div className="card" style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>
                    <p className="stat-label">Total Gastos Fijos Mensuales</p>
                    <p className="stat-value amount-expense" style={{ fontSize: '1.5rem' }}>
                        {formatCurrency(totalFixed)}
                    </p>
                </div>

                {/* Add button */}
                {!showForm && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                        style={{ marginBottom: 'var(--spacing-lg)' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Agregar Gasto Fijo
                    </button>
                )}

                {/* Add form */}
                {showForm && (
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <form className="form" onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Descripción</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Ej: Alquiler, Internet, Luz..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="input-group">
                                <label>Monto Mensual (UYU)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="input input-money"
                                    placeholder="0"
                                    value={amount}
                                    onChange={handleAmountChange}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setDescription('');
                                        setAmount('');
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!description.trim() || !amount}
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List */}
                {expenses.length > 0 ? (
                    <div className="transaction-list">
                        {expenses.map((expense) => (
                            <div key={expense.id} className="transaction-item">
                                <div className="transaction-icon fixed">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                    </svg>
                                </div>
                                <div className="transaction-info">
                                    <p className="transaction-description">{expense.description}</p>
                                    <span className="badge badge-fixed">Mensual</span>
                                </div>
                                <p className="transaction-amount amount-expense">
                                    {formatCurrency(expense.amount)}
                                </p>
                                <button
                                    className="btn btn-delete btn-sm"
                                    onClick={() => onDelete(expense.id)}
                                    title="Eliminar"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        </svg>
                        <p>No hay gastos fijos</p>
                        <p style={{ fontSize: '0.875rem' }}>Agrega tus gastos recurrentes mensuales</p>
                    </div>
                )}

                <div style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                        💡 Los gastos fijos se aplican automáticamente cada mes hasta que los elimines.
                    </p>
                </div>
            </div>
        </div>
    );
}
