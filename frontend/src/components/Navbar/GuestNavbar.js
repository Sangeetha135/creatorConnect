import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const GuestNavbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    <Link to="/" className="logo">
                        Influencer
                    </Link>
                </div>

                <div className="navbar-right">
                    <Link to="/login" className="auth-button login-button">
                        Login
                    </Link>
                    <Link to="/register" className="auth-button register-button">
                        Register
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default GuestNavbar; 