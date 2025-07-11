import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCampaigns } from '../features/campaigns/campaignSlice';
import { Box, Container, Typography, Grid, Card, CardContent, Button } from '@mui/material';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { campaigns, loading } = useSelector((state) => state.campaigns);

    useEffect(() => {
        dispatch(fetchCampaigns());
    }, [dispatch]);

    const CreatorDashboard = () => (
        <Box>
            <Typography variant="h4" gutterBottom>
                Creator Dashboard
            </Typography>
            <Grid container spacing={3}>
                {campaigns.map((campaign) => (
                    <Grid item xs={12} md={6} key={campaign._id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{campaign.title}</Typography>
                                <Typography color="textSecondary">
                                    Budget: ${campaign.budget}
                                </Typography>
                                <Typography variant="body2">
                                    {campaign.description}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 2 }}
                                >
                                    Apply Now
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    const BrandDashboard = () => (
        <Box>
            <Typography variant="h4" gutterBottom>
                Brand Dashboard
            </Typography>
            <Button
                variant="contained"
                color="primary"
                sx={{ mb: 3 }}
            >
                Create New Campaign
            </Button>
            <Grid container spacing={3}>
                {campaigns.map((campaign) => (
                    <Grid item xs={12} md={6} key={campaign._id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{campaign.title}</Typography>
                                <Typography color="textSecondary">
                                    Budget: ${campaign.budget}
                                </Typography>
                                <Typography variant="body2">
                                    {campaign.description}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Status: {campaign.status}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    sx={{ mt: 2 }}
                                >
                                    View Details
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {user?.role === 'creator' ? <CreatorDashboard /> : <BrandDashboard />}
        </Container>
    );
};

export default Dashboard;