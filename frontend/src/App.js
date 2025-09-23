import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ChakraLayout from './components/ChakraLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ProjectForm from './pages/ProjectForm';
import ProjectList from './pages/ProjectList';
import TestDashboard from './pages/TestDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChakraAdminDashboard from './pages/ChakraAdminDashboard';
import HorizonDashboard from './pages/HorizonDashboard';
import EnhancedDashboard from './pages/EnhancedDashboard';
// New design components
import CategoriesDashboard from './pages/CategoriesDashboard';
import MaterialsDashboard from './pages/MaterialsDashboard';
import UsersDashboard from './pages/UsersDashboard';
import FormPrices from './pages/FormPrices';
import AdminProjectsDashboard from './pages/AdminProjectsDashboard';
import TestProjectsAPI from './pages/TestProjectsAPI';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import PrivateRoute from './components/PrivateRoute';
import HomeRedirect from './components/HomeRedirect';
import theme from './theme';

function App() {
  console.log('🚀 App component is rendering');
  
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth Routes - NO Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes with Chakra UI Layout */}
            <Route path="/" element={<Layout><PrivateRoute><HomeRedirect /></PrivateRoute></Layout>} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/projects" element={<Layout><PrivateRoute><ProjectList /></PrivateRoute></Layout>} />
            <Route path="/projects/new" element={<Layout><PrivateRoute><ProjectForm /></PrivateRoute></Layout>} />
            <Route path="/projects/edit/:id" element={<Layout><PrivateRoute><ProjectForm /></PrivateRoute></Layout>} />
            
            {/* Enhanced Analytics Dashboard */}
            <Route path="/admin" element={<Layout><PrivateRoute><ProfessionalDashboard /></PrivateRoute></Layout>} />
            <Route path="/admin-chakra" element={<ChakraLayout><PrivateRoute><ChakraAdminDashboard /></PrivateRoute></ChakraLayout>} />
            <Route path="/admin-horizon" element={<PrivateRoute><HorizonDashboard /></PrivateRoute>} />
            <Route path="/admin-old" element={<Layout><PrivateRoute><AdminDashboard /></PrivateRoute></Layout>} />
            
            {/* New Design Components */}
            <Route path="/admin/categories" element={<Layout><PrivateRoute><CategoriesDashboard /></PrivateRoute></Layout>} />
            <Route path="/admin/materials" element={<Layout><PrivateRoute><MaterialsDashboard /></PrivateRoute></Layout>} />
            <Route path="/admin/users" element={<Layout><PrivateRoute><UsersDashboard /></PrivateRoute></Layout>} />
            <Route path="/admin/prices" element={<Layout><PrivateRoute><FormPrices /></PrivateRoute></Layout>} />
            <Route path="/admin/projects" element={<Layout><PrivateRoute><AdminProjectsDashboard /></PrivateRoute></Layout>} />
            
            {/* Debug routes */}
            <Route path="/test" element={<TestDashboard />} />
            <Route path="/test-api" element={<Layout><PrivateRoute><TestProjectsAPI /></PrivateRoute></Layout>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
