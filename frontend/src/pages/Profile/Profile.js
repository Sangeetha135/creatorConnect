import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import BrandProfile from './BrandProfile';
import InfluencerProfile from './InfluencerProfile';

const Profile = () => {
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.role === 'brand') {
        return <BrandProfile />;
    }

    if (user.role === 'influencer') {
        return <InfluencerProfile />;
    }

    return <Navigate to="/dashboard" />;
};

export default Profile; 