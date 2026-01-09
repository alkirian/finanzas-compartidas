import { useState } from 'react';
import { formatCurrency, formatDate, getMonthName } from '../lib/storage';

export default function History({ transactions, fixedExpenses, onEdit, onDelete }) {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());

    // Filter transactions for selected month
    const filteredTransactions = transactions.filter((t) => {
        const date = new Date(t.created_at);
        return date.getFullYear() === selectedYear && date.getMonth() === selectedMonth;
    });

    // Calculate monthly totals
    const income = filteredTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const fixedTotal = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);

    const navigateMonth = (direction) => {
        let newMonth = selectedMonth + direction;
        let newYear = selectedYear;

        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }

        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

    return (
        <div className="page">
            <div className="container">
                <div className="header">
                    <h1 className="header-title">📋 Historial</h1>
                </div>

                {/* Month Selector */}
                <div className="month-selector">
                    <button onClick={() => navigateMonth(-1)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <span>{getMonthName(selectedMonth)} {selectedYear}</span>
                    <button onClick={() => navigateMonth(1)} disabled={isCurrentMonth} style={{ opacity: isCurrentMonth ? 0.3 : 1 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>

                {/* Monthly Summary */}
                <div className="stats-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div className="stat-card">
                        <p className="stat-label">Ingresos</p>
                        <p className="stat-value amount-income" style={{ fontSize: '1.1rem' }}>{formatCurrency(income)}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">Gastos Totales</p>
                        <p className="stat-value amount-expense" style={{ fontSize: '1.1rem' }}>{formatCurrency(expenses + fixedTotal)}</p>
                    </div>
                </div>

                {/* Fixed Expenses Section */}
                {fixedExpenses.length > 0 && (
                    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <h3 className="section-title">Gastos Fijos del Mes</h3>
                        <div className="transaction-list">
                            {fixedExpenses.map((expense) => (
                                <div key={expense.id} className="transaction-item">
                                    <div className="transaction-icon fixed">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                        </svg>
                                    </div>
                                    <div className="transaction-info">
                                        <p className="transaction-description">{expense.description}</p>
                                        <span className="badge badge-fixed">Fijo</span>
                                    </div>
                                    <p className="transaction-amount amount-expense">
                                        {formatCurrency(expense.amount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Variable Transactions */}
                <div>
                    <h3 className="section-title">Movimientos Variables</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-md)' }}>
                        Toca un movimiento para editarlo
                    </p>
                    {filteredTransactions.length > 0 ? (
                        <div className="transaction-list">
                            {filteredTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="transaction-item transaction-item-clickable"
                                    onClick={() => onEdit(transaction)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className={`transaction-icon ${transaction.type}`}>
                                        {transaction.type === 'income' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="12" y1="19" x2="12" y2="5"></line>
                                                <polyline points="5 12 12 5 19 12"></polyline>
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                <polyline points="19 12 12 19 5 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                    <div className="transaction-info">
                                        <p className="transaction-description">{transaction.description}</p>
                                        <p className="transaction-date">{formatDate(transaction.created_at)}</p>
                                    </div>
                                    <p className={`transaction-amount ${transaction.type === 'income' ? 'amount-income' : 'amount-expense'}`}>
                                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                    </p>
                                    <div className="transaction-edit-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <p>Sin movimientos en {getMonthName(selectedMonth)}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
