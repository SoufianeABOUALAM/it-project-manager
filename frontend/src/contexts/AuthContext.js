import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import secureLog from '../utils/secureLogger';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(() => {
        // Check if we have a token in localStorage AND sessionStorage
        const localToken = localStorage.getItem('authToken');
        const sessionToken = sessionStorage.getItem('authToken');
        
        // If we have a session token, use it (browser is still open)
        if (sessionToken) {
            return sessionToken;
        }
        
        // If we only have local token, it means browser was closed and reopened
        // Clear it and return null
        if (localToken) {
            localStorage.removeItem('authToken');
            return null;
        }
        
        return null;
    });
    const [loading, setLoading] = useState(true);
    
    // Session timeout in milliseconds (30 minutes)
    const SESSION_TIMEOUT = 30 * 60 * 1000;

    const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/auth/';

    const loginUser = async (username, password) => {
        try {
            const response = await axios.post(`${API_URL}login/`, { username, password });
            const token = response.data.data.token;
            setAuthToken(token);
            // Store in both localStorage and sessionStorage
            localStorage.setItem('authToken', token);
            sessionStorage.setItem('authToken', token);
            
            // Fetch profile with the new token
            const profileResponse = await axios.get(`${API_URL}profile/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
            setUser(profileResponse.data);
            setLoading(false);
            // Login successful - no sensitive data logged
        } catch (error) {
            // Login failed - no sensitive data logged
            throw error;
        }
    };

    const registerUser = async (username, email, password, password2) => {
        try {
            const response = await axios.post(`${API_URL}register/`, { username, email, password, password2 });
            await loginUser(username, password);
            return response.data;
        } catch (error) {
            // Registration failed - no sensitive data logged
            throw error;
        }
    };

    const logoutUser = async () => {
        // Call backend logout endpoint if token exists
        if (authToken) {
            try {
                await axios.post(`${API_URL}logout/`, {}, {
                    headers: {
                        Authorization: `Token ${authToken}`
                    }
                });
            } catch (error) {
                // Logout API call failed - no sensitive data logged
            }
        }
        
        setAuthToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
    };

    const getProfile = useCallback(async (token = authToken) => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(`${API_URL}profile/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
            setUser(response.data);
        } catch (error) {
            // Only logout if it's a 401 (unauthorized) error, not network errors
            if (error.response?.status === 401) {
                logoutUser();
            } else {
                // For other errors, just set loading to false without logging out
                setLoading(false);
            }
        } finally {
            setLoading(false);
        }
    }, [authToken]);

    useEffect(() => {
        if (authToken) {
            getProfile();
        } else {
            setLoading(false);
        }
    }, [authToken, getProfile]);

    // Handle session timeout only - browser close is handled by sessionStorage
    useEffect(() => {
        let sessionTimeoutId;
        let lastActivity = Date.now();

        const handleActivity = () => {
            lastActivity = Date.now();
        };

        const checkSessionTimeout = () => {
            if (authToken && Date.now() - lastActivity > SESSION_TIMEOUT) {
                logoutUser();
            }
        };

        // Add activity listeners for session timeout
        window.addEventListener('mousedown', handleActivity);
        window.addEventListener('keypress', handleActivity);
        window.addEventListener('scroll', handleActivity);

        // Set up session timeout check
        if (authToken) {
            sessionTimeoutId = setInterval(checkSessionTimeout, 60000); // Check every minute
        }

        // Cleanup function
        return () => {
            window.removeEventListener('mousedown', handleActivity);
            window.removeEventListener('keypress', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            if (sessionTimeoutId) {
                clearInterval(sessionTimeoutId);
            }
        };
    }, [authToken]);

    const refreshUser = async () => {
        if (authToken) {
            await getProfile();
        }
    };

    const contextData = {
        user,
        authToken,
        loginUser,
        logoutUser,
        registerUser,
        refreshUser,
        loading,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? <p>Loading...</p> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
