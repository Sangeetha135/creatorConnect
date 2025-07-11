import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { isAuthenticated, logout } = useAuth();
    
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
                    Influencer Platform
                </Typography>
                
                <Box sx={{ flexGrow: 1 }} />
                
                {isAuthenticated && (
                    <>
                        <Button 
                            color="inherit" 
                            component={Link} 
                            to="/campaigns/completed"
                            sx={{ mr: 2 }}
                        >
                            Completed Campaigns
                        </Button>
                        <Button 
                            color="inherit" 
                            component={Link} 
                            to="/campaigns"
                            sx={{ mr: 2 }}
                        >
                            Active Campaigns
                        </Button>
                        <Button 
                            color="inherit" 
                            component={Link} 
                            to="/profile"
                            sx={{ mr: 2 }}
                        >
                            Profile
                        </Button>
                    </>
                )}
                
                {!isAuthenticated ? (
                    <Button color="inherit" component={Link} to="/login">
                        Login
                    </Button>
                ) : (
                    <Button color="inherit" onClick={logout}>
                        Logout
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header; 