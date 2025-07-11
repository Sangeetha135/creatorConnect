import React, { useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    TextField,
    IconButton,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { Close as CloseIcon, Link as LinkIcon } from '@mui/icons-material';
import axios from '../utils/axiosConfig';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
};

const ContentSubmissionModal = ({ open, onClose, campaign }) => {
    const [contentUrl, setContentUrl] = useState('');
    const [urlType, setUrlType] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const validateUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!contentUrl || !validateUrl(contentUrl)) {
            setError('Please enter a valid URL');
            return;
        }

        if (!urlType) {
            setError('Please select a URL type');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await axios.post('/api/content/submit', {
                campaignId: campaign._id,
                contentUrl,
                urlType,
                description
            });

            setSuccess(true);
            setLoading(false);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setContentUrl('');
                setUrlType('');
                setDescription('');
            }, 2000);
        } catch (error) {
            console.error('Content submission error:', error);
            setError(error.response?.data?.message || 'Error submitting content');
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setContentUrl('');
            setUrlType('');
            setDescription('');
            setError(null);
            setSuccess(false);
            onClose();
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="content-submission-modal"
        >
            <Box sx={style}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                        Submit Content for {campaign?.title}
                    </Typography>
                    {!loading && (
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    )}
                </Box>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success">
                            Content submitted successfully!
                        </Alert>
                    )}

                    <FormControl fullWidth required>
                        <InputLabel id="url-type-label">URL Type</InputLabel>
                        <Select
                            labelId="url-type-label"
                            value={urlType}
                            label="URL Type"
                            onChange={(e) => setUrlType(e.target.value)}
                        >
                            <MenuItem value="youtube">YouTube</MenuItem>
                            <MenuItem value="googledrive">Google Drive</MenuItem>
                            <MenuItem value="dropbox">Dropbox</MenuItem>
                            <MenuItem value="onedrive">OneDrive</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Content URL"
                        value={contentUrl}
                        onChange={(e) => setContentUrl(e.target.value)}
                        placeholder="Enter content URL"
                        required
                        error={!!error && error.includes('URL')}
                        helperText={error && error.includes('URL') ? error : ''}
                    />

                    <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={3}
                        maxRows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a description of your content..."
                        required
                    />

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2,
                        mt: 2,
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                    }}>
                        <Button
                            variant="outlined"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading || !contentUrl || !urlType || !description.trim()}
                            startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
                        >
                            {loading ? 'Submitting...' : 'Submit Content'}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
};

export default ContentSubmissionModal; 