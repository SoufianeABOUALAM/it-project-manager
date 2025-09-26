// Secure logging utility - only logs in development mode
// Prevents sensitive data from appearing in production console

const isDevelopment = process.env.NODE_ENV === 'development';

export const secureLog = {
    // General logging - only in development
    log: (...args) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },
    
    // Error logging - only in development
    error: (...args) => {
        if (isDevelopment) {
            console.error(...args);
        }
    },
    
    // Warning logging - only in development
    warn: (...args) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },
    
    // Info logging - only in development
    info: (...args) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },
    
    // Debug logging - only in development
    debug: (...args) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    },
    
    // Safe error logging - never logs sensitive data
    safeError: (message, error) => {
        if (isDevelopment) {
            console.error(message, {
                status: error?.response?.status,
                message: error?.message,
                // Never log response data or tokens
            });
        }
    },
    
    // Safe success logging - never logs sensitive data
    safeSuccess: (message) => {
        if (isDevelopment) {
            console.log(message);
        }
    }
};

// Export for use in components
export default secureLog;
