import { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import FixedExpenses from './components/FixedExpenses';
import Credits from './components/Credits';
import History from './components/History';
import QuickTransaction from './components/QuickTransaction';
import EditTransaction from './components/EditTransaction';
import Toast from './components/Toast';
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
  getFixedExpenses,
  addFixedExpense,
  deleteFixedExpense,
  getCredits,
  addCredit,
  deleteCredit,
  getActiveCreditsForMonth,
  getCreditsSummary,
  getMonthlyStats,
} from './lib/storage';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [preselectedType, setPreselectedType] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [credits, setCredits] = useState([]);
  const [activeCredits, setActiveCredits] = useState([]);
  const [creditsSummary, setCreditsSummary] = useState({ totalRemaining: 0, activeCount: 0, totalMonthly: 0 });
  const [stats, setStats] = useState({
    income: 0,
    variableExpenses: 0,
    fixedExpenses: 0,
    creditsExpenses: 0,
    totalExpenses: 0,
    balance: 0,
  });

  const loadData = useCallback(async () => {
    try {
      const now = new Date();
      const [loadedTransactions, loadedFixedExpenses, loadedCredits] = await Promise.all([
        getTransactions(),
        getFixedExpenses(),
        getCredits(),
      ]);

      const loadedActiveCredits = getActiveCreditsForMonth(loadedCredits, now.getFullYear(), now.getMonth());
      const loadedCreditsSummary = getCreditsSummary(loadedCredits);
      const monthlyStats = getMonthlyStats(
        loadedTransactions,
        loadedFixedExpenses,
        loadedCredits,
        now.getFullYear(),
        now.getMonth()
      );

      setTransactions(loadedTransactions);
      setFixedExpenses(loadedFixedExpenses);
      setCredits(loadedCredits);
      setActiveCredits(loadedActiveCredits);
      setCreditsSummary(loadedCreditsSummary);
      setStats(monthlyStats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleAddTransaction = async (transaction) => {
    await addTransaction(transaction);
    loadData();
    showToast(transaction.type === 'income' ? '¡Ingreso guardado!' : '¡Gasto guardado!');
  };

  const handleUpdateTransaction = async (transaction) => {
    await updateTransaction(transaction.id, {
      type: transaction.type,
      description: transaction.description,
      amount: transaction.amount,
    });
    loadData();
    showToast('¡Cambios guardados!');
  };

  const handleDeleteTransaction = async (id) => {
    await deleteTransaction(id);
    loadData();
    showToast('Movimiento eliminado', 'info');
  };

  const handleAddFixedExpense = async (expense) => {
    await addFixedExpense(expense);
    loadData();
    showToast('¡Gasto fijo guardado!');
  };

  const handleDeleteFixedExpense = async (id) => {
    await deleteFixedExpense(id);
    loadData();
    showToast('Gasto fijo eliminado', 'info');
  };

  const handleAddCredit = async (credit) => {
    await addCredit(credit);
    loadData();
    showToast('¡Crédito guardado!');
  };

  const handleDeleteCredit = async (id) => {
    await deleteCredit(id);
    loadData();
    showToast('Crédito eliminado', 'info');
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
  };

  const openTransactionModal = (type = null) => {
    setPreselectedType(type);
    setShowTransactionModal(true);
  };

  // Handle voice command from Gemini AI
  const handleVoiceCommand = async (result) => {
    if (result.action === 'add_transaction') {
      // Single transaction
      const newTransaction = await addTransaction({
        type: result.type,
        amount: result.amount,
        description: result.description,
      });
      if (newTransaction) {
        loadData();
        const typeLabel = result.type === 'income' ? 'Ingreso' : 'Gasto';
        showToast(`¡${typeLabel} de $${result.amount.toLocaleString('es-UY')} registrado!`);
      }
    } else if (result.action === 'add_multiple') {
      // Multiple transactions
      let successCount = 0;
      for (const t of result.transactions) {
        const newTransaction = await addTransaction({
          type: t.type,
          amount: t.amount,
          description: t.description,
        });
        if (newTransaction) successCount++;
      }
      loadData();
      showToast(`¡${successCount} transacciones registradas por voz!`);
    } else if (result.action === 'error') {
      showToast(result.message, 'error');
    }
  };

  const handleVoiceError = (message) => {
    showToast(message, 'error');
  };

  // Get current month transactions
  const now = new Date();
  const currentMonthTransactions = transactions.filter((t) => {
    const date = new Date(t.created_at);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--color-text-muted)' }}>Cargando...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* Main Content */}
      {activeTab === 'dashboard' && (
        <Dashboard
          stats={stats}
          recentTransactions={currentMonthTransactions}
          fixedExpenses={fixedExpenses}
          activeCredits={activeCredits}
          onEditTransaction={handleEditTransaction}
          onQuickAdd={openTransactionModal}
          onVoiceCommand={handleVoiceCommand}
          onVoiceError={handleVoiceError}
        />
      )}
      {activeTab === 'fixed' && (
        <FixedExpenses
          expenses={fixedExpenses}
          onAdd={handleAddFixedExpense}
          onDelete={handleDeleteFixedExpense}
        />
      )}
      {activeTab === 'credits' && (
        <Credits
          credits={credits}
          activeCredits={activeCredits}
          summary={creditsSummary}
          onAdd={handleAddCredit}
          onDelete={handleDeleteCredit}
        />
      )}
      {activeTab === 'history' && (
        <History
          transactions={transactions}
          fixedExpenses={fixedExpenses}
          activeCredits={activeCredits}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      )}

      {/* Add Transaction Modal */}
      {showTransactionModal && (
        <QuickTransaction
          onSave={handleAddTransaction}
          onClose={() => {
            setShowTransactionModal(false);
            setPreselectedType(null);
          }}
          preselectedType={preselectedType}
        />
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransaction
          transaction={editingTransaction}
          onSave={handleUpdateTransaction}
          onDelete={handleDeleteTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="nav-bar">
        <div className="nav-bar-inner">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Inicio</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'fixed' ? 'active' : ''}`}
            onClick={() => setActiveTab('fixed')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            <span>Fijos</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'credits' ? 'active' : ''}`}
            onClick={() => setActiveTab('credits')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            <span>Créditos</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>Historial</span>
          </button>
        </div>
      </nav>
    </>
  );
}

export default App;
