import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Box,
    Chip,
    Button,
    LinearProgress,
    Paper,
    Avatar,
    Divider,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { format, isValid, parseISO } from 'date-fns';
import './CompletedCampaigns.css';

const CompletedCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState(null);
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchCompletedCampaigns();
    }, []);

    const fetchCompletedCampaigns = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/campaigns/completed');
            setCampaigns(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch completed campaigns');
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        const date = parseISO(dateString);
        return isValid(date) ? format(date, 'MMM dd, yyyy') : 'Invalid date';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const handleDeleteClick = (campaign) => {
        setCampaignToDelete(campaign);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/api/campaigns/${campaignToDelete._id}`);
            setCampaigns(campaigns.filter(c => c._id !== campaignToDelete._id));
            setDeleteDialogOpen(false);
            setCampaignToDelete(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete campaign');
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <LinearProgress />
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography>Loading completed campaigns...</Typography>
            </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', color: 'error.main' }}>
                    <Typography>{error}</Typography>
                </Box>
            </Container>
        );
    }

    if (campaigns.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        No completed campaigns found
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Completed Campaigns
            </Typography>

            <Grid container spacing={3}>
                {campaigns.map((campaign) => (
                    <Grid item xs={12} key={campaign._id}>
                        <Card className="campaign-card">
                            <CardContent>
                                <Box className="campaign-header" display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center" gap={2}>
                                    <Typography variant="h5" component="h2">
                                        {campaign.title}
                                    </Typography>
                                    <Chip 
                                        label="Completed"
                                        color="success"
                                            size="small"
                                        />
                                    </Box>
                                    {(user.role === 'brand' && user._id === campaign.brand._id) && (
                                        <IconButton 
                                            color="error"
                                            onClick={() => handleDeleteClick(campaign)}
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </Box>

                                <Grid container spacing={3} sx={{ mt: 2 }}>
                                    <Grid item xs={12} md={6}>
                                        <Box mb={3}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Brand
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Avatar 
                                                    src={campaign.brand?.logoUrl} 
                                                    alt={campaign.brand?.companyName}
                                                    sx={{ width: 32, height: 32 }}
                                                >
                                                    {campaign.brand?.companyName?.[0]}
                                                </Avatar>
                                                <Typography>
                                                    {campaign.brand?.companyName}
                                </Typography>
                                            </Box>
                                        </Box>

                                        <Typography variant="subtitle2" color="textSecondary">
                                            Description
                                        </Typography>
                                <Typography variant="body2" paragraph>
                                    {campaign.description}
                                </Typography>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Box mb={3}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Timeline
                                            </Typography>
                                            <Typography variant="body2">
                                                Start Date: {formatDate(campaign.startDate)}
                                            </Typography>
                                            <Typography variant="body2">
                                                End Date: {formatDate(campaign.endDate)}
                                            </Typography>
                                            <Typography variant="body2">
                                                Completed: {formatDate(campaign.completedDate)}
                                            </Typography>
                                        </Box>

                                        <Typography variant="subtitle2" color="textSecondary">
                                            Compensation
                                        </Typography>
                                        <Typography variant="body1" color="primary">
                                            {formatCurrency(campaign.compensation || campaign.budget)}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 3 }} />

                                <Typography variant="h6" gutterBottom>
                                    Content Submissions
                                </Typography>
                                <Grid container spacing={2}>
                                    {campaign.approvedContent?.map((content) => (
                                        <Grid item xs={12} key={content._id}>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Box display="flex" alignItems="center" gap={2}>
                                                        <Avatar 
                                                            src={content.creator?.profilePictureUrl}
                                                            sx={{ width: 40, height: 40 }}
                                                        >
                                                            {content.creator?.name?.[0]}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle1">
                                                                {content.creator?.name}
                                                    </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Button 
                                                        variant="outlined" 
                                                        size="small"
                                                        href={content.contentUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        View Content
                                                    </Button>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Campaign</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this campaign? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CompletedCampaigns; 