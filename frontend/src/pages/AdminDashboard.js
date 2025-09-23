import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Chip,
    IconButton,
    Alert
} from '@mui/material';
import {
    AdminPanelSettings,
    People,
    Business,
    Inventory,
    TrendingUp,
    Add,
    Edit,
    Delete,
    Visibility,
    PersonAdd,
    BusinessCenter,
    Category
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserForm from '../components/UserForm';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

const AdminDashboard = () => {
    const { authToken, user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProjects: 0,
        totalMaterials: 0,
        activeProjects: 0
    });
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [userFormOpen, setUserFormOpen] = useState(false);

    useEffect(() => {
        if (user && user.is_admin) {
            fetchAdminData();
        } else {
            setError('Access denied. Admin privileges required.');
            setLoading(false);
        }
    }, [user, fetchAdminData]);

    const fetchAdminData = async () => {
        try {
            // Fetch real-time dashboard statistics
            const [dashboardRes, usersRes, projectsRes, materialsRes] = await Promise.all([
                axios.get(`${API_URL}dashboard/stats/`, {
                    headers: { Authorization: `Token ${authToken}` }
                }),
                axios.get(`${API_URL}auth/users/`, {
                    headers: { Authorization: `Token ${authToken}` }
                }),
                axios.get(`${API_URL}projects/`, {
                    headers: { Authorization: `Token ${authToken}` }
                }),
                axios.get(`${API_URL}materials/`, {
                    headers: { Authorization: `Token ${authToken}` }
                })
            ]);

            const dashboardData = dashboardRes.data;
            const users = Array.isArray(usersRes.data) ? usersRes.data : [];
            const projects = Array.isArray(projectsRes.data) ? projectsRes.data : [];
            const materials = Array.isArray(materialsRes.data) ? materialsRes.data : [];

            console.log('API Response Data:', {
                dashboard: dashboardData,
                users: usersRes.data,
                projects: projectsRes.data,
                materials: materialsRes.data
            });

            setUsers(users);
            setProjects(projects);
            setMaterials(materials);
            
            // Use real-time data from dashboard API
            setStats({
                totalUsers: dashboardData.summary.total_users,
                totalProjects: dashboardData.summary.total_projects,
                totalMaterials: dashboardData.summary.total_materials,
                activeProjects: dashboardData.summary.active_projects
            });
            
            setError(null);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
            console.error('Error details:', error.response?.data);
            
            if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
                setError('Backend server is not running. Please start the Django server.');
            } else if (error.response?.status === 403) {
                setError('Access denied. You do not have admin privileges.');
            } else if (error.response?.status === 401) {
                setError('Authentication failed. Please login again.');
            } else {
                setError(`Failed to load admin data: ${error.response?.data?.detail || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`${API_URL}auth/users/${userId}/`, {
                    headers: { Authorization: `Token ${authToken}` }
                });
                fetchAdminData();
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await axios.delete(`${API_URL}projects/${projectId}/`, {
                    headers: { Authorization: `Token ${authToken}` }
                });
                fetchAdminData();
            } catch (error) {
                console.error('Failed to delete project:', error);
            }
        }
    };

    const handleDeleteMaterial = async (materialId) => {
        if (window.confirm('Are you sure you want to delete this material?')) {
            try {
                await axios.delete(`${API_URL}materials/${materialId}/`, {
                    headers: { Authorization: `Token ${authToken}` }
                });
                fetchAdminData();
            } catch (error) {
                console.error('Failed to delete material:', error);
            }
        }
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <Typography variant="h6">Loading admin dashboard...</Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    const renderOverview = () => (
        <Box>
            <Typography variant="h5" gutterBottom>
                System Overview
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ textAlign: 'center', p: 2 }}>
                        <CardContent>
                            <People color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" component="div">
                                {stats.totalUsers}
                            </Typography>
                            <Typography color="textSecondary">
                                Total Users
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ textAlign: 'center', p: 2 }}>
                        <CardContent>
                            <Business color="success" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" component="div">
                                {stats.totalProjects}
                            </Typography>
                            <Typography color="textSecondary">
                                Total Projects
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ textAlign: 'center', p: 2 }}>
                        <CardContent>
                            <Inventory color="info" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" component="div">
                                {stats.totalMaterials}
                            </Typography>
                            <Typography color="textSecondary">
                                Total Materials
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ textAlign: 'center', p: 2 }}>
                        <CardContent>
                            <TrendingUp color="warning" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" component="div">
                                {stats.activeProjects}
                            </Typography>
                            <Typography color="textSecondary">
                                Active Projects
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    const renderUsers = () => (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                    User Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => setUserFormOpen(true)}
                >
                    Add User
                </Button>
            </Box>
            <Paper>
                <List>
                    {users.map((user, index) => (
                        <React.Fragment key={user.id}>
                            <ListItem>
                                <ListItemIcon>
                                    <People />
                                </ListItemIcon>
                                <ListItemText
                                    primary={user.username}
                                    secondary={`${user.email} • Joined: ${new Date(user.date_joined).toLocaleDateString()}`}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip 
                                        label={user.role_display || user.role} 
                                        color={
                                            user.role === 'super_admin' ? 'error' : 
                                            user.role === 'admin' ? 'warning' : 
                                            'default'
                                        }
                                        size="small"
                                    />
                                    <IconButton size="small" title="View">
                                        <Visibility />
                                    </IconButton>
                                    <IconButton size="small" title="Edit">
                                        <Edit />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        title="Delete"
                                        color="error"
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            </ListItem>
                            {index < users.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Box>
    );

    const renderProjects = () => (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                    Project Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<BusinessCenter />}
                    onClick={() => navigate('/projects/new')}
                >
                    Add Project
                </Button>
            </Box>
            <Paper>
                <List>
                    {projects.map((project, index) => (
                        <React.Fragment key={project.id}>
                            <ListItem>
                                <ListItemIcon>
                                    <Business />
                                </ListItemIcon>
                                <ListItemText
                                    primary={project.name}
                                    secondary={`${project.entity} • ${project.number_of_users} users • ${project.user?.username}`}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip 
                                        label={project.status || 'Draft'} 
                                        color={project.status === 'active' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Box>
                            </ListItem>
                            {index < projects.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Box>
    );

    const renderMaterials = () => (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                    Material Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Category />}
                    onClick={() => {/* TODO: Add material creation */}}
                >
                    Add Material
                </Button>
            </Box>
            <Paper>
                <List>
                    {materials.map((material, index) => (
                        <React.Fragment key={material.id}>
                            <ListItem>
                                <ListItemIcon>
                                    <Inventory />
                                </ListItemIcon>
                                <ListItemText
                                    primary={material.name}
                                    secondary={`${material.category?.name} • €${material.price_france} / ${material.price_morocco} MAD`}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip 
                                        label={material.is_active ? 'Active' : 'Inactive'} 
                                        color={material.is_active ? 'success' : 'default'}
                                        size="small"
                                    />
                                    <IconButton size="small" title="View">
                                        <Visibility />
                                    </IconButton>
                                    <IconButton size="small" title="Edit">
                                        <Edit />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        title="Delete"
                                        color="error"
                                        onClick={() => handleDeleteMaterial(material.id)}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            </ListItem>
                            {index < materials.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Box>
    );

    return (
        <Container maxWidth="lg">
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            <AdminPanelSettings sx={{ mr: 2, verticalAlign: 'middle' }} />
                            Admin Dashboard
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                            Manage users, projects, and materials
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        size="large"
                        onClick={() => navigate('/projects/new')}
                        sx={{ 
                            backgroundColor: '#1976d2',
                            '&:hover': { backgroundColor: '#1565c0' }
                        }}
                    >
                        New Project
                    </Button>
                </Box>
            </Box>

            {/* Navigation Tabs */}
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={1}>
                    {[
                        { id: 'overview', label: 'Overview', icon: <TrendingUp /> },
                        { id: 'users', label: 'Users', icon: <People /> },
                        { id: 'projects', label: 'Projects', icon: <Business /> },
                        { id: 'materials', label: 'Materials', icon: <Inventory /> }
                    ].map((tab) => (
                        <Grid item key={tab.id}>
                            <Button
                                variant={selectedTab === tab.id ? 'contained' : 'outlined'}
                                startIcon={tab.icon}
                                onClick={() => setSelectedTab(tab.id)}
                            >
                                {tab.label}
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Content */}
            {selectedTab === 'overview' && renderOverview()}
            {selectedTab === 'users' && renderUsers()}
            {selectedTab === 'projects' && renderProjects()}
            {selectedTab === 'materials' && renderMaterials()}

            {/* User Creation Form */}
            <UserForm
                open={userFormOpen}
                onClose={() => setUserFormOpen(false)}
                onSuccess={() => fetchAdminData()}
                authToken={authToken}
                currentUser={user}
            />
        </Container>
    );
};

export default AdminDashboard;
