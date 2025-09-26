import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h3>Loading authentication...</h3>
                <p>Please wait while we verify your login status.</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }
    
    return (
        <div>
            {children}
        </div>
    );
};

export default PrivateRoute;

