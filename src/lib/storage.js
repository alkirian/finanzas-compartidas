import { supabase } from './supabase';

// ============ TRANSACTIONS ============

export const getTransactions = async () => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
    return data || [];
};

export const addTransaction = async (transaction) => {
    const { data, error } = await supabase
        .from('transactions')
        .insert([{
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
        }])
        .select()
        .single();

    if (error) {
        console.error('Error adding transaction:', error);
        return null;
    }
    return data;
};

export const updateTransaction = async (id, updates) => {
    const { error } = await supabase
        .from('transactions')
        .update({
            type: updates.type,
            amount: updates.amount,
            description: updates.description,
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating transaction:', error);
    }
};

export const deleteTransaction = async (id) => {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting transaction:', error);
    }
};

// ============ FIXED EXPENSES ============

export const getFixedExpenses = async () => {
    const { data, error } = await supabase
        .from('fixed_expenses')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching fixed expenses:', error);
        return [];
    }
    return data || [];
};

export const addFixedExpense = async (expense) => {
    const { data, error } = await supabase
        .from('fixed_expenses')
        .insert([{
            amount: expense.amount,
            description: expense.description,
        }])
        .select()
        .single();

    if (error) {
        console.error('Error adding fixed expense:', error);
        return null;
    }
    return data;
};

export const deleteFixedExpense = async (id) => {
    const { error } = await supabase
        .from('fixed_expenses')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting fixed expense:', error);
    }
};

// ============ CREDITS ============

export const getCredits = async () => {
    const { data, error } = await supabase
        .from('credits')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching credits:', error);
        return [];
    }
    return data || [];
};

export const addCredit = async (credit) => {
    const installmentAmount = Math.ceil(credit.totalAmount / credit.installments);

    const { data, error } = await supabase
        .from('credits')
        .insert([{
            description: credit.description,
            total_amount: credit.totalAmount,
            installments: credit.installments,
            installment_amount: installmentAmount,
            start_month: credit.startMonth,
            start_year: credit.startYear,
        }])
        .select()
        .single();

    if (error) {
        console.error('Error adding credit:', error);
        return null;
    }
    return data;
};

export const deleteCredit = async (id) => {
    const { error } = await supabase
        .from('credits')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting credit:', error);
    }
};

// ============ HELPER FUNCTIONS ============

// Get credits active for a specific month
export const getActiveCreditsForMonth = (credits, year, month) => {
    const activeCredits = [];

    credits.forEach((credit) => {
        const startDate = new Date(credit.start_year, credit.start_month);
        const checkDate = new Date(year, month);

        const monthsDiff = (checkDate.getFullYear() - startDate.getFullYear()) * 12
            + (checkDate.getMonth() - startDate.getMonth());

        if (monthsDiff >= 0 && monthsDiff < credit.installments) {
            activeCredits.push({
                ...credit,
                currentInstallment: monthsDiff + 1,
                installmentAmount: credit.installment_amount,
                totalAmount: credit.total_amount,
                startMonth: credit.start_month,
                startYear: credit.start_year,
            });
        }
    });

    return activeCredits;
};

// Get credit summary
export const getCreditsSummary = (credits) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let totalRemaining = 0;
    let activeCount = 0;
    let totalMonthly = 0;

    credits.forEach((credit) => {
        const startDate = new Date(credit.start_year, credit.start_month);
        const monthsDiff = (currentYear - startDate.getFullYear()) * 12
            + (currentMonth - startDate.getMonth());

        if (monthsDiff >= 0 && monthsDiff < credit.installments) {
            activeCount++;
            totalMonthly += credit.installment_amount;
            const remainingInstallments = credit.installments - monthsDiff;
            totalRemaining += credit.installment_amount * remainingInstallments;
        } else if (monthsDiff < 0) {
            totalRemaining += credit.total_amount;
        }
    });

    return {
        totalRemaining,
        activeCount,
        totalMonthly,
        totalCredits: credits.length,
    };
};

// Get transactions for a specific month
export const getMonthlyTransactions = (transactions, year, month) => {
    return transactions.filter((t) => {
        const date = new Date(t.created_at);
        return date.getFullYear() === year && date.getMonth() === month;
    });
};

// Calculate monthly stats
export const getMonthlyStats = (transactions, fixedExpenses, credits, year, month) => {
    const monthlyTransactions = getMonthlyTransactions(transactions, year, month);
    const activeCredits = getActiveCreditsForMonth(credits, year, month);

    const income = monthlyTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const variableExpenses = monthlyTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const fixedTotal = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const creditsTotal = activeCredits.reduce((sum, c) => sum + c.installment_amount, 0);

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

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency: 'UYU',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-UY', {
        day: 'numeric',
        month: 'short',
    }).format(date);
};

export const getMonthName = (month) => {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month];
};

export const getMonthNameShort = (month) => {
    const months = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return months[month];
};
