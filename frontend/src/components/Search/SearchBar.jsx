import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Autocomplete,
    TextField,
    Avatar,
    Box,
    Typography,
    Paper,
    CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!searchQuery.trim()) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`http://localhost:3000/api/users/search?query=${encodeURIComponent(searchQuery)}`);
                const data = await response.json();

                if (response.ok) {
                    setSuggestions(data);
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handleOptionSelect = (event, value) => {
        if (value) {
            navigate(`/profile/${value._id}`);
        }
    };

    return (
        <Autocomplete
            freeSolo
            options={suggestions}
            getOptionLabel={(option) => option.name || ''}
            filterOptions={(x) => x}
            loading={loading}
            onInputChange={(event, value) => setSearchQuery(value)}
            onChange={handleOptionSelect}
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder="Search for brands or creators..."
                    variant="outlined"
                    fullWidth
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '20px',
                            backgroundColor: 'white',
                            '&:hover': {
                                backgroundColor: '#f8f8f8',
                            },
                        },
                    }}
                />
            )}
            renderOption={(props, option) => (
                <Box
                    component="li"
                    {...props}
                    sx={{
                        '&:hover': {
                            backgroundColor: '#f5f5f5',
                        },
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {option.profilePictureUrl ? (
                            <Avatar
                                src={option.profilePictureUrl}
                                alt={option.name}
                                sx={{ width: 32, height: 32, mr: 2 }}
                            />
                        ) : (
                            <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                                {option.role === 'brand' ? <BusinessIcon /> : <PersonIcon />}
                            </Avatar>
                        )}
                        <Box>
                            <Typography variant="body1">{option.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {option.role === 'brand' ? 'Brand' : 'Creator'}
                                {option.role === 'brand' && option.companyName && ` • ${option.companyName}`}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            )}
            PaperComponent={({ children, ...props }) => (
                <Paper {...props} elevation={3}>
                    {children}
                </Paper>
            )}
        />
    );
};

export default SearchBar; 