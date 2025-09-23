import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || null);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://127.0.0.1:8000/api/auth/';

    const loginUser = async (username, password) => {
        try {
            const response = await axios.post(`${API_URL}login/`, { username, password });
            const token = response.data.data.token;
            setAuthToken(token);
            localStorage.setItem('authToken', token);
            
            // Fetch profile with the new token
            const profileResponse = await axios.get(`${API_URL}profile/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
            setUser(profileResponse.data);
            setLoading(false);
            console.log('Login successful, user set:', profileResponse.data);
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            throw error;
        }
    };

    const registerUser = async (username, email, password, password2) => {
        try {
            const response = await axios.post(`${API_URL}register/`, { username, email, password, password2 });
            await loginUser(username, password);
            return response.data;
        } catch (error) {
            console.error("Registration failed:", error.response?.data || error.message);
            throw error;
        }
    };

    const logoutUser = () => {
        setAuthToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
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
            console.error("Failed to fetch user profile:", error.response?.data || error.message);
            logoutUser();
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
