import React from 'react';
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const GuestNavbar = () => {
    return (
        <AppBar position="fixed">
            <Toolbar>
                <Typography
                    variant="h6"
                    component={Link}
                    to="/"
                    sx={{
                        flexGrow: 1,
                        textDecoration: 'none',
                        color: 'inherit',
                        fontWeight: 'bold'
                    }}
                >
                    Influencer Platform
                </Typography>
                <Box>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/login"
                        sx={{ marginRight: 2 }}
                    >
                        Login
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        component={Link}
                        to="/register"
                    >
                        Register
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default GuestNavbar; 