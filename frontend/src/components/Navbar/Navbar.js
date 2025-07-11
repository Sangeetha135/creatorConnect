import React from 'react';
import { useSelector } from 'react-redux';
import AuthNavbar from './AuthNavbar';
import GuestNavbar from './GuestNavbar';

const Navbar = () => {
    const { user } = useSelector((state) => state.auth);

    return user ? <AuthNavbar /> : <GuestNavbar />;
};

export default Navbar; 