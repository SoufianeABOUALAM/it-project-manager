import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SessionTimeout = () => {
    const { logoutUser } = useAuth();
    const [showWarning, setShowWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    
    // Warning time before logout (5 minutes)
    const WARNING_TIME = 5 * 60 * 1000;
    const SESSION_TIMEOUT = 30 * 60 * 1000;

    useEffect(() => {
        let warningTimeoutId;
        let countdownIntervalId;

        const startSessionTimer = () => {
            // Show warning 5 minutes before timeout
            warningTimeoutId = setTimeout(() => {
                setShowWarning(true);
                setTimeLeft(WARNING_TIME / 1000); // Convert to seconds
                
                // Start countdown
                countdownIntervalId = setInterval(() => {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            logoutUser();
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }, SESSION_TIMEOUT - WARNING_TIME);
        };

        // Reset timers on user activity
        const handleActivity = () => {
            if (warningTimeoutId) {
                clearTimeout(warningTimeoutId);
            }
            if (countdownIntervalId) {
                clearInterval(countdownIntervalId);
            }
            setShowWarning(false);
            setTimeLeft(0);
            startSessionTimer();
        };

        // Add activity listeners
        window.addEventListener('mousedown', handleActivity);
        window.addEventListener('keypress', handleActivity);
        window.addEventListener('scroll', handleActivity);

        // Start the initial timer
        startSessionTimer();

        return () => {
            window.removeEventListener('mousedown', handleActivity);
            window.removeEventListener('keypress', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            if (warningTimeoutId) {
                clearTimeout(warningTimeoutId);
            }
            if (countdownIntervalId) {
                clearInterval(countdownIntervalId);
            }
        };
    }, [logoutUser]);

    const handleStayLoggedIn = () => {
        setShowWarning(false);
        setTimeLeft(0);
        // Reset the session timer
        window.dispatchEvent(new Event('mousedown'));
    };

    const handleLogout = () => {
        logoutUser();
    };

    if (!showWarning) {
        return null;
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                maxWidth: '400px',
                width: '90%'
            }}>
                <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>
                    Session Timeout Warning
                </h3>
                <p style={{ marginBottom: '20px', fontSize: '16px' }}>
                    Your session will expire in <strong>{minutes}:{seconds.toString().padStart(2, '0')}</strong>
                </p>
                <p style={{ marginBottom: '25px', color: '#666' }}>
                    Click "Stay Logged In" to continue your session, or you will be automatically logged out.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                        onClick={handleStayLoggedIn}
                        style={{
                            backgroundColor: '#27ae60',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Stay Logged In
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Logout Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionTimeout;
