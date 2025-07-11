import React from 'react';
import {
    Box,
    Typography,
    LinearProgress,
    Tooltip,
    Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const MatchScoreBreakdown = ({ breakdown }) => {
    const criteriaLabels = {
        category: 'Content Category',
        subscribers: 'Subscriber Count',
        views: 'Average Views',
        platforms: 'Platform Presence',
        location: 'Location Match'
    };

    return (
        <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                Match Score Breakdown
            </Typography>
            {Object.entries(breakdown).map(([criterion, data]) => (
                <Box key={criterion} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                            {criteriaLabels[criterion]}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                {data.score}/{data.max}
                            </Typography>
                            {data.matched ? (
                                <Tooltip title="Criteria Met">
                                    <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                                </Tooltip>
                            ) : (
                                <Tooltip title="Criteria Not Met">
                                    <CancelIcon color="error" sx={{ fontSize: 16 }} />
                                </Tooltip>
                            )}
                        </Box>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={(data.score / data.max) * 100}
                        sx={{
                            height: 6,
                            borderRadius: 1,
                            bgcolor: 'background.paper',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: data.matched ? 'success.main' : 'error.main',
                            },
                        }}
                    />
                </Box>
            ))}
        </Paper>
    );
};

export default MatchScoreBreakdown; 