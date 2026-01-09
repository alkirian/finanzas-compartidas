import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import FixedExpenses from './components/FixedExpenses';
import Credits from './components/Credits';
import History from './components/History';
import QuickTransaction from './components/QuickTransaction';
import EditTransaction from './components/EditTransaction';
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
  const [editingTransaction, setEditingTransaction] = useState(null);
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

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const now = new Date();
    const loadedTransactions = getTransactions();
    const loadedFixedExpenses = getFixedExpenses();
    const loadedCredits = getCredits();
    const loadedActiveCredits = getActiveCreditsForMonth(now.getFullYear(), now.getMonth());
    const loadedCreditsSummary = getCreditsSummary();
    const monthlyStats = getMonthlyStats(now.getFullYear(), now.getMonth());

    setTransactions(loadedTransactions);
    setFixedExpenses(loadedFixedExpenses);
    setCredits(loadedCredits);
    setActiveCredits(loadedActiveCredits);
    setCreditsSummary(loadedCreditsSummary);
    setStats(monthlyStats);
  };

  const handleAddTransaction = (transaction) => {
    addTransaction(transaction);
    loadData();
  };

  const handleUpdateTransaction = (transaction) => {
    updateTransaction(transaction.id, {
      type: transaction.type,
      description: transaction.description,
      amount: transaction.amount,
    });
    loadData();
  };

  const handleDeleteTransaction = (id) => {
    deleteTransaction(id);
    loadData();
  };

  const handleAddFixedExpense = (expense) => {
    addFixedExpense(expense);
    loadData();
  };

  const handleDeleteFixedExpense = (id) => {
    deleteFixedExpense(id);
    loadData();
  };

  const handleAddCredit = (credit) => {
    addCredit(credit);
    loadData();
  };

  const handleDeleteCredit = (id) => {
    deleteCredit(id);
    loadData();
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
  };

  // Get current month transactions
  const now = new Date();
  const currentMonthTransactions = transactions.filter((t) => {
    const date = new Date(t.createdAt);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });

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

      {/* FAB */}
      <button className="fab" onClick={() => setShowTransactionModal(true)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      {/* Add Transaction Modal */}
      {showTransactionModal && (
        <QuickTransaction
          onSave={handleAddTransaction}
          onClose={() => setShowTransactionModal(false)}
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
