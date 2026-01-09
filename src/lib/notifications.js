// Push Notifications Service for transaction alerts

// Check if notifications are supported
export function isNotificationSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator;
}

// Get current permission status
export function getNotificationPermission() {
    if (!isNotificationSupported()) return 'unsupported';
    return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission() {
    if (!isNotificationSupported()) {
        console.log('❌ Notifications not supported');
        return 'unsupported';
    }

    if (Notification.permission === 'granted') {
        console.log('✅ Notifications already permitted');
        return 'granted';
    }

    if (Notification.permission === 'denied') {
        console.log('🚫 Notifications denied by user');
        return 'denied';
    }

    try {
        const permission = await Notification.requestPermission();
        console.log('📱 Notification permission:', permission);
        return permission;
    } catch (error) {
        console.error('Error requesting permission:', error);
        return 'error';
    }
}

// Format currency for display
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency: 'UYU',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Send a notification for a transaction
export async function sendTransactionNotification(transaction) {
    if (!isNotificationSupported()) return false;

    if (Notification.permission !== 'granted') {
        console.log('⚠️ Notification permission not granted');
        return false;
    }

    const isIncome = transaction.type === 'income';
    const emoji = isIncome ? '💰' : '💸';
    const typeLabel = isIncome ? 'Ingreso' : 'Gasto';
    const amount = formatCurrency(transaction.amount);

    const title = `${emoji} ${typeLabel} registrado`;
    const body = `${transaction.description}: ${amount}`;

    try {
        // Try using Service Worker for better mobile support
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
                body: body,
                icon: '/finanzas-compartidas/icon-192.png',
                badge: '/finanzas-compartidas/icon-192.png',
                tag: `transaction-${Date.now()}`,
                vibrate: isIncome ? [200, 100, 200] : [100, 50, 100],
                data: { transaction },
                requireInteraction: false,
                silent: false,
            });
        } else {
            // Fallback to regular notification
            new Notification(title, {
                body: body,
                icon: '/finanzas-compartidas/icon-192.png',
                tag: `transaction-${Date.now()}`,
            });
        }

        console.log('✅ Notification sent:', title, body);
        return true;
    } catch (error) {
        console.error('Error sending notification:', error);
        return false;
    }
}

// Send notification for multiple transactions
export async function sendMultipleTransactionsNotification(transactions) {
    if (!isNotificationSupported()) return false;

    if (Notification.permission !== 'granted') {
        return false;
    }

    const count = transactions.length;
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') {
            totalIncome += t.amount;
        } else {
            totalExpense += t.amount;
        }
    });

    const title = `📝 ${count} transacciones registradas`;
    let body = '';

    if (totalIncome > 0 && totalExpense > 0) {
        body = `+${formatCurrency(totalIncome)} ingresos, -${formatCurrency(totalExpense)} gastos`;
    } else if (totalIncome > 0) {
        body = `+${formatCurrency(totalIncome)} en ingresos`;
    } else {
        body = `-${formatCurrency(totalExpense)} en gastos`;
    }

    try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
                body: body,
                icon: '/finanzas-compartidas/icon-192.png',
                badge: '/finanzas-compartidas/icon-192.png',
                tag: `transactions-multiple-${Date.now()}`,
                vibrate: [100, 50, 100, 50, 100],
                requireInteraction: false,
            });
        } else {
            new Notification(title, {
                body: body,
                icon: '/finanzas-compartidas/icon-192.png',
            });
        }

        console.log('✅ Multiple notification sent:', title, body);
        return true;
    } catch (error) {
        console.error('Error sending notification:', error);
        return false;
    }
}
