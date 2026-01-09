import { formatCurrency, formatDate, getMonthName } from '../lib/storage';

export default function Dashboard({ stats, recentTransactions, fixedExpenses, activeCredits, onEditTransaction, onQuickAdd }) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return (
        <div className="page">
            <div className="container">
                {/* Header with prominent month */}
                <div className="dashboard-header">
                    <span className="dashboard-emoji">💰</span>
                    <h1 className="dashboard-title">Finanzas</h1>
                    <div className="month-display">
                        <span className="month-name">{getMonthName(currentMonth)}</span>
                        <span className="month-year">{currentYear}</span>
                    </div>
                </div>

                {/* Balance Card */}
                <div className="balance-card">
                    <p className="balance-label">Saldo del Mes</p>
                    <p className={`balance-value`} style={{ color: stats.balance >= 0 ? '#10B981' : '#EF4444' }}>
                        {formatCurrency(stats.balance)}
                    </p>
                </div>

                {/* Stats Grid - Clickable */}
                <div className="stats-grid-clickable">
                    <button
                        className="stat-card-clickable income"
                        onClick={() => onQuickAdd('income')}
                    >
                        <div className="stat-card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="19" x2="12" y2="5"></line>
                                <polyline points="5 12 12 5 19 12"></polyline>
                            </svg>
                        </div>
                        <p className="stat-label">Ingresos</p>
                        <p className="stat-value amount-income">{formatCurrency(stats.income)}</p>
                        <span className="stat-add-hint">+ agregar</span>
                    </button>
                    <button
                        className="stat-card-clickable expense"
                        onClick={() => onQuickAdd('expense')}
                    >
                        <div className="stat-card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <polyline points="19 12 12 19 5 12"></polyline>
                            </svg>
                        </div>
                        <p className="stat-label">Gastos</p>
                        <p className="stat-value amount-expense">{formatCurrency(stats.totalExpenses)}</p>
                        <span className="stat-add-hint">+ agregar</span>
                    </button>
                </div>

                {/* Breakdown */}
                <div className="breakdown-section">
                    <div className="breakdown-grid">
                        <div className="breakdown-item">
                            <span className="breakdown-label">Fijos</span>
                            <span className="breakdown-value">{formatCurrency(stats.fixedExpenses)}</span>
                        </div>
                        <div className="breakdown-divider"></div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Variables</span>
                            <span className="breakdown-value">{formatCurrency(stats.variableExpenses)}</span>
                        </div>
                        {stats.creditsExpenses > 0 && (
                            <>
                                <div className="breakdown-divider"></div>
                                <div className="breakdown-item">
                                    <span className="breakdown-label">Cuotas</span>
                                    <span className="breakdown-value">{formatCurrency(stats.creditsExpenses)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Active Credits This Month */}
                {activeCredits && activeCredits.length > 0 && (
                    <div style={{ marginTop: 'var(--spacing-xl)' }}>
                        <h3 className="section-title">💳 Cuotas del Mes</h3>
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

                {/* Fixed Expenses Summary */}
                {fixedExpenses.length > 0 && (
                    <div style={{ marginTop: 'var(--spacing-xl)' }}>
                        <h3 className="section-title">📌 Gastos Fijos</h3>
                        <div className="transaction-list">
                            {fixedExpenses.slice(0, 3).map((expense) => (
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
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Transactions */}
                {recentTransactions.length > 0 && (
                    <div style={{ marginTop: 'var(--spacing-xl)' }}>
                        <h3 className="section-title">Últimos Movimientos</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)', marginTop: '-0.5rem' }}>
                            Toca para editar
                        </p>
                        <div className="transaction-list">
                            {recentTransactions.slice(0, 5).map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="transaction-item transaction-item-clickable"
                                    onClick={() => onEditTransaction(transaction)}
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
                    </div>
                )}

                {/* Empty state */}
                {recentTransactions.length === 0 && fixedExpenses.length === 0 && (!activeCredits || activeCredits.length === 0) && (
                    <div className="empty-state" style={{ marginTop: 'var(--spacing-xl)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                            <line x1="2" y1="10" x2="22" y2="10"></line>
                        </svg>
                        <p>No hay movimientos aún</p>
                        <p style={{ fontSize: '0.875rem' }}>Toca Ingresos o Gastos para agregar</p>
                    </div>
                )}
            </div>
        </div>
    );
}
