import { useState } from 'react';
import { formatCurrency, getMonthName } from '../lib/storage';

export default function Credits({ credits, activeCredits, summary, onAdd, onDelete }) {
    const [showForm, setShowForm] = useState(false);
    const [description, setDescription] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [installments, setInstallments] = useState('3');
    const [startMonth, setStartMonth] = useState(new Date().getMonth());
    const [startYear, setStartYear] = useState(new Date().getFullYear());

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description.trim() || !totalAmount || !installments) return;

        onAdd({
            description: description.trim(),
            totalAmount: parseFloat(totalAmount),
            installments: parseInt(installments),
            startMonth,
            startYear,
        });

        setDescription('');
        setTotalAmount('');
        setInstallments('3');
        setStartMonth(new Date().getMonth());
        setStartYear(new Date().getFullYear());
        setShowForm(false);
    };

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setTotalAmount(value);
    };

    const handleInstallmentsChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (parseInt(value) <= 48 || value === '') {
            setInstallments(value);
        }
    };

    // Calculate preview
    const previewInstallment = totalAmount && installments
        ? Math.ceil(parseFloat(totalAmount) / parseInt(installments))
        : 0;

    // Generate month options (current month + next 12 months)
    const monthOptions = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() + i);
        monthOptions.push({
            month: date.getMonth(),
            year: date.getFullYear(),
            label: `${getMonthName(date.getMonth())} ${date.getFullYear()}`
        });
    }

    return (
        <div className="page">
            <div className="container">
                <div className="header">
                    <h1 className="header-title">💳 Créditos</h1>
                </div>

                {/* Summary Card */}
                <div className="card" style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>
                    <div className="stats-grid" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <div>
                            <p className="stat-label">Cuotas Este Mes</p>
                            <p className="stat-value amount-expense">{formatCurrency(summary.totalMonthly)}</p>
                        </div>
                        <div>
                            <p className="stat-label">Por Pagar</p>
                            <p className="stat-value" style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(summary.totalRemaining)}</p>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        {summary.activeCount} crédito{summary.activeCount !== 1 ? 's' : ''} activo{summary.activeCount !== 1 ? 's' : ''}
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
                        Nueva Compra en Cuotas
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
                                    placeholder="Ej: TV Samsung, Celular..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="input-group">
                                <label>Monto Total (UYU)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="input input-money"
                                    placeholder="0"
                                    value={totalAmount}
                                    onChange={handleAmountChange}
                                />
                            </div>

                            <div className="input-group">
                                <label>Cantidad de Cuotas</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="input"
                                    placeholder="3"
                                    value={installments}
                                    onChange={handleInstallmentsChange}
                                    style={{ textAlign: 'center' }}
                                />
                            </div>

                            <div className="input-group">
                                <label>Primera Cuota</label>
                                <select
                                    className="input"
                                    value={`${startMonth}-${startYear}`}
                                    onChange={(e) => {
                                        const [m, y] = e.target.value.split('-');
                                        setStartMonth(parseInt(m));
                                        setStartYear(parseInt(y));
                                    }}
                                >
                                    {monthOptions.map((opt) => (
                                        <option key={`${opt.month}-${opt.year}`} value={`${opt.month}-${opt.year}`}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Preview */}
                            {previewInstallment > 0 && (
                                <div style={{
                                    padding: 'var(--spacing-md)',
                                    background: 'var(--color-bg)',
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                        Pagarás
                                    </p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-expense)' }}>
                                        {formatCurrency(previewInstallment)} x {installments} cuotas
                                    </p>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setDescription('');
                                        setTotalAmount('');
                                        setInstallments('3');
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!description.trim() || !totalAmount || !installments}
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Active Credits This Month */}
                {activeCredits.length > 0 && (
                    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <h3 className="section-title">Cuotas de Este Mes</h3>
                        <div className="transaction-list">
                            {activeCredits.map((credit) => (
                                <div key={credit.id} className="transaction-item">
                                    <div className="transaction-icon" style={{ background: 'var(--color-expense-light)', color: 'var(--color-expense)' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                            <line x1="1" y1="10" x2="23" y2="10"></line>
                                        </svg>
                                    </div>
                                    <div className="transaction-info">
                                        <p className="transaction-description">{credit.description}</p>
                                        <span className="badge" style={{ background: 'var(--color-expense-light)', color: 'var(--color-expense)' }}>
                                            Cuota {credit.currentInstallment}/{credit.installments}
                                        </span>
                                    </div>
                                    <p className="transaction-amount amount-expense">
                                        {formatCurrency(credit.installmentAmount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Credits */}
                <div>
                    <h3 className="section-title">Todos los Créditos</h3>
                    {credits.length > 0 ? (
                        <div className="transaction-list">
                            {credits.map((credit) => {
                                // Calculate status
                                const now = new Date();
                                const startDate = new Date(credit.startYear, credit.startMonth);
                                const endDate = new Date(credit.startYear, credit.startMonth + credit.installments - 1);
                                const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());

                                let status = '';
                                let statusColor = 'var(--color-text-muted)';

                                if (monthsDiff < 0) {
                                    status = `Empieza ${getMonthName(credit.startMonth)}`;
                                    statusColor = 'var(--color-primary)';
                                } else if (monthsDiff >= credit.installments) {
                                    status = 'Pagado ✓';
                                    statusColor = 'var(--color-income)';
                                } else {
                                    const remaining = credit.installments - monthsDiff;
                                    status = `${remaining} cuota${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}`;
                                }

                                return (
                                    <div key={credit.id} className="transaction-item">
                                        <div className="transaction-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                                <line x1="1" y1="10" x2="23" y2="10"></line>
                                            </svg>
                                        </div>
                                        <div className="transaction-info">
                                            <p className="transaction-description">{credit.description}</p>
                                            <p style={{ fontSize: '0.75rem', color: statusColor }}>{status}</p>
                                            <p className="transaction-date">
                                                {formatCurrency(credit.installmentAmount)} x {credit.installments} = {formatCurrency(credit.totalAmount)}
                                            </p>
                                        </div>
                                        <button
                                            className="btn btn-delete btn-sm"
                                            onClick={() => onDelete(credit.id)}
                                            title="Eliminar"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                            </svg>
                            <p>No hay créditos</p>
                            <p style={{ fontSize: '0.875rem' }}>Agrega compras en cuotas</p>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                        💡 Las cuotas se suman automáticamente a tus gastos mensuales durante el período que corresponda.
                    </p>
                </div>
            </div>
        </div>
    );
}
