import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    console.log('PrivateRoute: Current path:', location.pathname);
    console.log('PrivateRoute: Auth state:', { user, loading });

    if (loading) {
        console.log('PrivateRoute: Still loading auth state');
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        console.log('PrivateRoute: No authenticated user, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} />;
    }

    console.log('PrivateRoute: User authenticated, rendering protected content');
    return children;
};

export default PrivateRoute;