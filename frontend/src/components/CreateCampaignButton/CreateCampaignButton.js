import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCampaignButton.css';

const CreateCampaignButton = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/campaigns/create');
    };

    return (
        <button className="create-campaign-button" onClick={handleClick}>
            <span className="button-icon">+</span>
            Create New Campaign
        </button>
    );
};

export default CreateCampaignButton; 