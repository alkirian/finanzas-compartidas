// Mobile UX Utilities

/**
 * Trigger haptic feedback if supported
 * @param {'light' | 'medium' | 'success' | 'error'} type - Type of haptic feedback
 */
export function hapticFeedback(type = 'light') {
    if (!navigator.vibrate) return;

    const patterns = {
        light: [10],
        medium: [30],
        success: [10, 50, 10],
        error: [50, 30, 50, 30, 50],
    };

    try {
        navigator.vibrate(patterns[type] || patterns.light);
    } catch (e) {
        // Vibration not supported or failed
    }
}

/**
 * Scroll to element ensuring it's visible above virtual keyboard
 * @param {HTMLElement} element - Element to scroll into view
 */
export function scrollToElement(element) {
    if (!element) return;

    // Use a small delay to ensure keyboard is visible
    setTimeout(() => {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }, 100);
}

/**
 * Check if running as installed PWA
 * @returns {boolean}
 */
export function isInstalledPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
}

/**
 * Get safe area insets for notch/rounded corners
 * @returns {{ top: number, bottom: number, left: number, right: number }}
 */
export function getSafeAreaInsets() {
    const computedStyle = getComputedStyle(document.documentElement);
    return {
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0'),
    };
}
