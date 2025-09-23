import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import axios from 'axios';

const UserForm = ({ open, onClose, onSuccess, authToken, currentUser }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        role: 'user'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Frontend validation
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.password2) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/auth/users/create/', formData, {
                headers: { Authorization: `Token ${authToken}` }
            });
            
            onSuccess(response.data);
            onClose();
            setFormData({
                username: '',
                email: '',
                password: '',
                password2: '',
                first_name: '',
                last_name: '',
                phone_number: '',
                role: 'user'
            });
        } catch (error) {
            console.error('User creation error:', error.response?.data);
            
            // Handle different types of errors
            if (error.response?.data) {
                const errorData = error.response.data;
                
                // Handle field-specific errors
                if (errorData.username) {
                    setError(`Username: ${Array.isArray(errorData.username) ? errorData.username[0] : errorData.username}`);
                } else if (errorData.email) {
                    setError(`Email: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`);
                } else if (errorData.password) {
                    setError(`Password: ${Array.isArray(errorData.password) ? errorData.password[0] : errorData.password}`);
                } else if (errorData.role) {
                    setError(`Role: ${Array.isArray(errorData.role) ? errorData.role[0] : errorData.role}`);
                } else if (errorData.non_field_errors) {
                    setError(Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors);
                } else {
                    setError('Failed to create user. Please check all fields.');
                }
            } else {
                setError('Failed to create user. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create New User</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            name="username"
                            label="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        
                        <TextField
                            name="email"
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        
                        <TextField
                            name="password"
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            fullWidth
                            helperText="Password must be at least 8 characters long"
                            error={formData.password.length > 0 && formData.password.length < 8}
                        />
                        
                        <TextField
                            name="password2"
                            label="Confirm Password"
                            type="password"
                            value={formData.password2}
                            onChange={handleChange}
                            required
                            fullWidth
                            helperText="Re-enter the same password"
                            error={formData.password2.length > 0 && formData.password !== formData.password2}
                        />
                        
                        <TextField
                            name="first_name"
                            label="First Name"
                            value={formData.first_name}
                            onChange={handleChange}
                            fullWidth
                        />
                        
                        <TextField
                            name="last_name"
                            label="Last Name"
                            value={formData.last_name}
                            onChange={handleChange}
                            fullWidth
                        />
                        
                        <TextField
                            name="phone_number"
                            label="Phone Number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            fullWidth
                        />
                        
                        {currentUser && currentUser.is_super_admin && (
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    label="Role"
                                >
                                    <MenuItem value="user">User</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="super_admin">Super Admin</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Creating...' : 'Create User'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UserForm;
