// Session management utilities for deployment-ready authentication

class SessionManager {
    constructor() {
        this.isClosing = false;
        this.init();
    }

    init() {
        // Track if user is actually closing the browser
        window.addEventListener('beforeunload', () => {
            this.isClosing = true;
        });

        // Handle browser close detection - only clear on actual browser close
        window.addEventListener('unload', () => {
            // Don't clear session on page unload - let localStorage persist
            // Only clear if it's a real browser close (detected by visibility change)
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isClosing) {
                // Browser is being closed - clear session
                this.clearSession();
            }
        });

        // Reset closing flag on page show
        window.addEventListener('pageshow', () => {
            this.isClosing = false;
        });
    }

    clearSession() {
        // Clear authentication token
        localStorage.removeItem('authToken');
        
        // Optional: Send logout request to server
        const token = localStorage.getItem('authToken');
        if (token) {
            // Use sendBeacon for reliable logout on page unload
            const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/auth/';
            navigator.sendBeacon(`${apiUrl}logout/`, JSON.stringify({
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            }));
        }
    }

    // Method to manually clear session (for logout button)
    manualLogout() {
        this.clearSession();
    }
}

// Export singleton instance
export const sessionManager = new SessionManager();
