// Storage keys
const TRANSACTIONS_KEY = 'finanzas_transactions';
const FIXED_EXPENSES_KEY = 'finanzas_fixed_expenses';
const CREDITS_KEY = 'finanzas_credits';

// Get all transactions
export const getTransactions = () => {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
};

// Save transactions
export const saveTransactions = (transactions) => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

// Add a new transaction
export const addTransaction = (transaction) => {
    const transactions = getTransactions();
    const newTransaction = {
        ...transaction,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };
    transactions.unshift(newTransaction);
    saveTransactions(transactions);
    return newTransaction;
};

// Delete a transaction
export const deleteTransaction = (id) => {
    const transactions = getTransactions().filter((t) => t.id !== id);
    saveTransactions(transactions);
};

// Update a transaction
export const updateTransaction = (id, updates) => {
    const transactions = getTransactions().map((t) =>
        t.id === id ? { ...t, ...updates } : t
    );
    saveTransactions(transactions);
};

// Get fixed expenses
export const getFixedExpenses = () => {
    const data = localStorage.getItem(FIXED_EXPENSES_KEY);
    return data ? JSON.parse(data) : [];
};

// Save fixed expenses
export const saveFixedExpenses = (expenses) => {
    localStorage.setItem(FIXED_EXPENSES_KEY, JSON.stringify(expenses));
};

// Add a fixed expense
export const addFixedExpense = (expense) => {
    const expenses = getFixedExpenses();
    const newExpense = {
        ...expense,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };
    expenses.push(newExpense);
    saveFixedExpenses(expenses);
    return newExpense;
};

// Update a fixed expense
export const updateFixedExpense = (id, updates) => {
    const expenses = getFixedExpenses().map((e) =>
        e.id === id ? { ...e, ...updates } : e
    );
    saveFixedExpenses(expenses);
};

// Delete a fixed expense
export const deleteFixedExpense = (id) => {
    const expenses = getFixedExpenses().filter((e) => e.id !== id);
    saveFixedExpenses(expenses);
};

// ============ CREDITS / INSTALLMENTS ============

// Get all credits
export const getCredits = () => {
    const data = localStorage.getItem(CREDITS_KEY);
    return data ? JSON.parse(data) : [];
};

// Save credits
export const saveCredits = (credits) => {
    localStorage.setItem(CREDITS_KEY, JSON.stringify(credits));
};

// Add a new credit
// credit: { description, totalAmount, installments, startMonth, startYear }
export const addCredit = (credit) => {
    const credits = getCredits();
    const installmentAmount = Math.ceil(credit.totalAmount / credit.installments);
    const newCredit = {
        ...credit,
        id: crypto.randomUUID(),
        installmentAmount,
        createdAt: new Date().toISOString(),
    };
    credits.push(newCredit);
    saveCredits(credits);
    return newCredit;
};

// Update a credit
export const updateCredit = (id, updates) => {
    const credits = getCredits().map((c) => {
        if (c.id === id) {
            const updated = { ...c, ...updates };
            // Recalculate installment amount if total or installments changed
            if (updates.totalAmount || updates.installments) {
                updated.installmentAmount = Math.ceil(updated.totalAmount / updated.installments);
            }
            return updated;
        }
        return c;
    });
    saveCredits(credits);
};

// Delete a credit
export const deleteCredit = (id) => {
    const credits = getCredits().filter((c) => c.id !== id);
    saveCredits(credits);
};

// Get credits active for a specific month
// Returns credits with their current installment number for that month
export const getActiveCreditsForMonth = (year, month) => {
    const credits = getCredits();
    const activeCredits = [];

    credits.forEach((credit) => {
        const startDate = new Date(credit.startYear, credit.startMonth);
        const checkDate = new Date(year, month);

        // Calculate months difference
        const monthsDiff = (checkDate.getFullYear() - startDate.getFullYear()) * 12
            + (checkDate.getMonth() - startDate.getMonth());

        // Check if this month is within the credit period
        if (monthsDiff >= 0 && monthsDiff < credit.installments) {
            activeCredits.push({
                ...credit,
                currentInstallment: monthsDiff + 1, // 1-indexed
            });
        }
    });

    return activeCredits;
};

// Get credit summary (total remaining, active count)
export const getCreditsSummary = () => {
    const credits = getCredits();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let totalRemaining = 0;
    let activeCount = 0;
    let totalMonthly = 0;

    credits.forEach((credit) => {
        const startDate = new Date(credit.startYear, credit.startMonth);
        const endDate = new Date(credit.startYear, credit.startMonth + credit.installments - 1);
        const currentDate = new Date(currentYear, currentMonth);

        // Calculate current installment (0-indexed)
        const monthsDiff = (currentDate.getFullYear() - startDate.getFullYear()) * 12
            + (currentDate.getMonth() - startDate.getMonth());

        if (monthsDiff >= 0 && monthsDiff < credit.installments) {
            // Credit is active this month
            activeCount++;
            totalMonthly += credit.installmentAmount;

            // Remaining installments including this one
            const remainingInstallments = credit.installments - monthsDiff;
            totalRemaining += credit.installmentAmount * remainingInstallments;
        } else if (monthsDiff < 0) {
            // Credit hasn't started yet, count full amount
            totalRemaining += credit.totalAmount;
        }
    });

    return {
        totalRemaining,
        activeCount,
        totalMonthly,
        totalCredits: credits.length,
    };
};

// ============ MONTHLY STATS ============

// Get transactions for a specific month
export const getMonthlyTransactions = (year, month) => {
    const transactions = getTransactions();
    return transactions.filter((t) => {
        const date = new Date(t.createdAt);
        return date.getFullYear() === year && date.getMonth() === month;
    });
};

// Calculate monthly stats (now includes credits)
export const getMonthlyStats = (year, month) => {
    const transactions = getMonthlyTransactions(year, month);
    const fixedExpenses = getFixedExpenses();
    const activeCredits = getActiveCreditsForMonth(year, month);

    const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const variableExpenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const fixedTotal = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const creditsTotal = activeCredits.reduce((sum, c) => sum + c.installmentAmount, 0);

    const totalExpenses = variableExpenses + fixedTotal + creditsTotal;
    const balance = income - totalExpenses;

    return {
        income,
        variableExpenses,
        fixedExpenses: fixedTotal,
        creditsExpenses: creditsTotal,
        totalExpenses,
        balance,
    };
};

// ============ UTILITY FUNCTIONS ============

// Format currency
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency: 'UYU',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Format date
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-UY', {
        day: 'numeric',
        month: 'short',
    }).format(date);
};

// Get month name
export const getMonthName = (month) => {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month];
};

// Get short month name
export const getMonthNameShort = (month) => {
    const months = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return months[month];
};
