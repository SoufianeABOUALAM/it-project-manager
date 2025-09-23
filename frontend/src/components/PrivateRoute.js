import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading, authToken } = useAuth();

    console.log('PrivateRoute - user:', user, 'loading:', loading, 'authToken:', authToken ? 'Present' : 'Missing');

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h3>Loading authentication...</h3>
                <p>Please wait while we verify your login status.</p>
            </div>
        );
    }

    if (!user) {
        console.log('PrivateRoute - No user found, redirecting to login');
        return <Navigate to="/login" />;
    }

    console.log('PrivateRoute - User authenticated, rendering children:', children);
    console.log('PrivateRoute - Children type:', typeof children);
    
    // Force render the children
    return (
        <div>
            {children}
        </div>
    );
};

export default PrivateRoute;

