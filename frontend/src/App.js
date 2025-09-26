import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ProjectForm from './pages/ProjectForm';
// New design components
import CategoriesDashboard from './pages/CategoriesDashboard';
import MaterialsDashboard from './pages/MaterialsDashboard';
import UsersDashboard from './pages/UsersDashboard';
import FormPrices from './pages/FormPrices';
import AdminProjectsDashboard from './pages/AdminProjectsDashboard';
// TestProjectsAPI removed - not needed for production
import CreativeDashboard from './pages/CreativeDashboard';
import PrivateRoute from './components/PrivateRoute';
import SessionTimeout from './components/SessionTimeout';
import theme from './theme';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth Routes - NO Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
                    {/* Protected Routes with Chakra UI Layout */}
                    <Route path="/" element={<Layout><PrivateRoute><CreativeDashboard /></PrivateRoute></Layout>} />
                    <Route path="/dashboard" element={<Layout><PrivateRoute><CreativeDashboard /></PrivateRoute></Layout>} />
            <Route path="/projects" element={<Layout><PrivateRoute><AdminProjectsDashboard /></PrivateRoute></Layout>} />
            <Route path="/projects/new" element={<Layout><PrivateRoute><ProjectForm /></PrivateRoute></Layout>} />
            <Route path="/projects/edit/:id" element={<Layout><PrivateRoute><ProjectForm /></PrivateRoute></Layout>} />
            
                    {/* Enhanced Analytics Dashboard */}
                    <Route path="/admin" element={<Layout><PrivateRoute><CreativeDashboard /></PrivateRoute></Layout>} />
            
            {/* New Design Components */}
            <Route path="/admin/categories" element={<Layout><PrivateRoute><CategoriesDashboard /></PrivateRoute></Layout>} />
            <Route path="/admin/materials" element={<Layout><PrivateRoute><MaterialsDashboard /></PrivateRoute></Layout>} />
            <Route path="/admin/users" element={<Layout><PrivateRoute><UsersDashboard /></PrivateRoute></Layout>} />
            <Route path="/admin/prices" element={<Layout><PrivateRoute><FormPrices /></PrivateRoute></Layout>} />
            <Route path="/admin/projects" element={<Layout><PrivateRoute><AdminProjectsDashboard /></PrivateRoute></Layout>} />
            
            {/* Debug routes */}
            {/* Test API route removed - not needed for production */}
          </Routes>
          <SessionTimeout />
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
