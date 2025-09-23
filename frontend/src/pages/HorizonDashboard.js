import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Button,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Container,
  Flex,
  Icon,
  Badge
} from '@chakra-ui/react';
import {
  MdDashboard,
  MdPeople,
  MdBusiness,
  MdInventory,
  MdCategory,
  MdSettings,
  MdRefresh
} from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/';

const HorizonDashboard = () => {
  const { authToken, user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [stats, setStats] = useState({
    total_users: 0,
    total_projects: 0,
    total_materials: 0,
    total_categories: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}dashboard/stats/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchStats();
    }
  }, [authToken]);

  const handleCreateProject = () => {
    // Simple project creation
    console.log('Create project clicked');
  };

  if (loading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading dashboard...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  const Sidebar = () => (
    <Box
      w="250px"
      h="100vh"
      bg="gray.50"
      borderRight="1px solid"
      borderColor="gray.200"
      p={4}
    >
      <VStack spacing={4} align="stretch">
        <Box mb={6}>
          <Heading size="md" color="blue.600">Admin Panel</Heading>
        </Box>
        
        <Button
          leftIcon={<Icon as={MdDashboard} />}
          variant={currentView === 'dashboard' ? 'solid' : 'ghost'}
          colorScheme="blue"
          justifyContent="flex-start"
          onClick={() => setCurrentView('dashboard')}
        >
          Dashboard
        </Button>
        
        <Button
          leftIcon={<Icon as={MdPeople} />}
          variant={currentView === 'users' ? 'solid' : 'ghost'}
          colorScheme="blue"
          justifyContent="flex-start"
          onClick={() => setCurrentView('users')}
        >
          Users
        </Button>
        
        <Button
          leftIcon={<Icon as={MdBusiness} />}
          variant={currentView === 'projects' ? 'solid' : 'ghost'}
          colorScheme="blue"
          justifyContent="flex-start"
          onClick={() => setCurrentView('projects')}
        >
          Projects
        </Button>
        
        <Button
          leftIcon={<Icon as={MdInventory} />}
          variant={currentView === 'materials' ? 'solid' : 'ghost'}
          colorScheme="blue"
          justifyContent="flex-start"
          onClick={() => setCurrentView('materials')}
        >
          Materials
        </Button>
        
        <Button
          leftIcon={<Icon as={MdCategory} />}
          variant={currentView === 'categories' ? 'solid' : 'ghost'}
          colorScheme="blue"
          justifyContent="flex-start"
          onClick={() => setCurrentView('categories')}
        >
          Categories
        </Button>
        
        <Button
          leftIcon={<Icon as={MdSettings} />}
          variant={currentView === 'settings' ? 'solid' : 'ghost'}
          colorScheme="blue"
          justifyContent="flex-start"
          onClick={() => setCurrentView('settings')}
        >
          Settings
        </Button>
      </VStack>
    </Box>
  );

  const DashboardView = () => (
    <Box p={6}>
      <Heading size="lg" mb={6}>Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <VStack spacing={2}>
              <Text fontSize="sm" color="gray.600">Total Users</Text>
              <Heading size="lg">{stats.total_users}</Heading>
            </VStack>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <VStack spacing={2}>
              <Text fontSize="sm" color="gray.600">Total Projects</Text>
              <Heading size="lg">{stats.total_projects}</Heading>
            </VStack>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <VStack spacing={2}>
              <Text fontSize="sm" color="gray.600">Total Materials</Text>
              <Heading size="lg">{stats.total_materials}</Heading>
            </VStack>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <VStack spacing={2}>
              <Text fontSize="sm" color="gray.600">Total Categories</Text>
              <Heading size="lg">{stats.total_categories}</Heading>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card>
        <CardHeader>
          <Heading size="md">Quick Actions</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            <Button
              colorScheme="blue"
              onClick={handleCreateProject}
            >
              New Project
            </Button>
            
            <Button
              colorScheme="green"
              onClick={() => setCurrentView('users')}
            >
              Manage Users
            </Button>
            
            <Button
              colorScheme="purple"
              onClick={() => setCurrentView('materials')}
            >
              View Materials
            </Button>
            
            <Button
              colorScheme="orange"
              onClick={() => setCurrentView('projects')}
            >
              View Projects
            </Button>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'users':
        return <Box p={6}><Heading>Users Management</Heading><Text>Users view coming soon...</Text></Box>;
      case 'projects':
        return <Box p={6}><Heading>Projects Management</Heading><Text>Projects view coming soon...</Text></Box>;
      case 'materials':
        return <Box p={6}><Heading>Materials Management</Heading><Text>Materials view coming soon...</Text></Box>;
      case 'categories':
        return <Box p={6}><Heading>Categories Management</Heading><Text>Categories view coming soon...</Text></Box>;
      case 'settings':
        return <Box p={6}><Heading>Settings</Heading><Text>Settings view coming soon...</Text></Box>;
      default:
        return <DashboardView />;
    }
  };

  return (
    <Flex h="100vh">
      <Sidebar />
      <Box flex="1" overflow="auto">
        {renderView()}
      </Box>
    </Flex>
  );
};

export default HorizonDashboard;
