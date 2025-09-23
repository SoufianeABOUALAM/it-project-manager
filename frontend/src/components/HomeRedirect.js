import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomeRedirect = () => {
    const { user } = useAuth();
    
    // If user is admin or super admin, redirect to admin dashboard
    if (user && user.is_admin) {
        return <Navigate to="/admin" replace />;
    }
    
    // Otherwise, redirect to regular project list
    return <Navigate to="/projects" replace />;
};

export default HomeRedirect;



