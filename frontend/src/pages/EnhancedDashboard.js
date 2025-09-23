import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, SimpleGrid, Text, Icon, Flex, Container, VStack, HStack, Badge, Card, CardBody, CardHeader, Heading, Alert, AlertIcon, Spinner, Center, Button, Spacer, useToast, Progress, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Divider, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, TableContainer, useColorModeValue, Tooltip, CircularProgress, CircularProgressLabel, Image, Avatar, Menu, MenuButton, MenuList, MenuItem, IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, Stack, Link, Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator
} from '@chakra-ui/react';
import {
  MdPeople, MdBusiness, MdInventory, MdTrendingUp, MdTrendingDown, MdCategory, MdAttachMoney, MdShoppingCart, MdAccountBalance, MdAssignment, MdFolder, MdCheckCircle, MdComputer, MdRouter, MdPrint, MdVideocam, MdWifi, MdAnalytics, MdShowChart, MdTimeline, MdSpeed, MdLocationOn, MdNetworkCheck, MdMenu, MdNotifications, MdSettings, MdDashboard, MdBarChart, MdPieChart, MdLineChart, MdRefresh, MdFilterList, MdSearch, MdAdd, MdEdit, MdDelete, MdVisibility, MdDownload, MdUpload, MdShare, MdMoreVert, MdHome, MdExitToApp, MdPerson, MdLock, MdEmail, MdPhone, MdCalendarToday, MdAccessTime, MdLanguage, MdDarkMode, MdLightMode, MdFullscreen, MdFullscreenExit
} from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/';

const EnhancedDashboard = () => {
  const { authToken, user } = useAuth();
  const isFetchingRef = useRef(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // State management
  const [currentView, setCurrentView] = useState('overview');
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');

  // Professional notification system
  const showNotification = useCallback(({ title, description, status = 'info' }) => {
    toast({
      title,
      description,
      status,
      duration: 4000,
      isClosable: true,
      position: 'top-right',
    });
  }, [toast]);

  // Fetch enhanced dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!authToken) {
      console.log('❌ No auth token available');
      return;
    }
    
    if (isFetchingRef.current) {
      console.log('⏳ Already fetching, skipping fetch');
      return;
    }
    
    isFetchingRef.current = true;

    try {
      console.log('🚀 Fetching enhanced dashboard data...');
      
      // Fetch data with error handling for each endpoint
      const promises = [
        axios.get(`${API_URL}dashboard/stats/`, {
          headers: { Authorization: `Token ${authToken}` }
        }).catch(err => {
          console.warn('⚠️ Dashboard stats not available:', err.response?.status);
          return { data: { total_users: 0, total_projects: 0, total_materials: 0, total_categories: 0 } };
        }),
        axios.get(`${API_URL}dashboard/charts/`, {
          headers: { Authorization: `Token ${authToken}` }
        }).catch(err => {
          console.warn('⚠️ Dashboard charts not available:', err.response?.status);
          return { data: {} };
        }),
        axios.get(`${API_URL}auth/users/`, {
          headers: { Authorization: `Token ${authToken}` },
          params: { page_size: 1000 }
        }).catch(err => {
          console.warn('⚠️ Users not available:', err.response?.status);
          return { data: { results: [] } };
        }),
        axios.get(`${API_URL}projects/projects/`, {
          headers: { Authorization: `Token ${authToken}` },
          params: { page_size: 1000 }
        }).catch(err => {
          console.warn('⚠️ Projects not available:', err.response?.status);
          return { data: { results: [] } };
        }),
        axios.get(`${API_URL}materials/materials/`, {
          headers: { Authorization: `Token ${authToken}` },
          params: { page_size: 1000 }
        }).catch(err => {
          console.warn('⚠️ Materials not available:', err.response?.status);
          return { data: { results: [] } };
        }),
        axios.get(`${API_URL}materials/categories/`, {
          headers: { Authorization: `Token ${authToken}` },
          params: { page_size: 1000 }
        }).catch(err => {
          console.warn('⚠️ Categories not available:', err.response?.status);
          return { data: { results: [] } };
        })
      ];

      const [statsRes, chartsRes, usersRes, projectsRes, materialsRes, categoriesRes] = await Promise.all(promises);

      setStats(statsRes.data);
      setCharts(chartsRes.data);
      setUsers(usersRes.data?.results || usersRes.data || []);
      setProjects(projectsRes.data?.results || projectsRes.data || []);
      setMaterials(materialsRes.data?.results || materialsRes.data || []);
      setCategories(categoriesRes.data?.results || categoriesRes.data || []);
      setLastUpdated(new Date());
      setError(null);
      
      console.log('✅ Dashboard data fetched successfully');
      
    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error);
      setError(error.response?.data?.error || 'Failed to fetch dashboard data');
      showNotification({
        title: 'Error',
        description: 'Failed to fetch dashboard data',
        status: 'error'
      });
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [authToken, showNotification]);

  // Auto-refresh effect
  useEffect(() => {
    if (user && (user.is_admin || user.is_super_admin)) {
      fetchDashboardData();
      
      if (autoRefresh) {
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
      }
    } else {
      setLoading(false);
    }
  }, [user, fetchDashboardData, autoRefresh]);

  // Format currency
  const formatCurrency = (amount, currency = 'EUR') => {
    if (currency === 'MAD') {
      return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Loading component
  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh">
        <Center h="100vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text fontSize="lg" color={textColor}>Loading Enhanced Analytics Dashboard...</Text>
            <Text fontSize="sm" color={subTextColor}>Fetching real-time data from your database</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  // Error component
  if (error) {
    return (
      <Box bg={bgColor} minH="100vh" p={8}>
        <Container maxW="container.xl">
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Error loading dashboard</Text>
              <Text>{error}</Text>
            </Box>
          </Alert>
          <Button mt={4} onClick={fetchDashboardData} colorScheme="blue" leftIcon={<Icon as={MdRefresh} />}>
            Retry
          </Button>
        </Container>
      </Box>
    );
  }

  // No data component
  if (!stats || !charts) {
    return (
      <Box bg={bgColor} minH="100vh" p={8}>
        <Container maxW="container.xl">
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Text>No dashboard data available</Text>
          </Alert>
        </Container>
      </Box>
    );
  }

  // Sidebar Component
  const Sidebar = () => (
    <Box
      w="250px"
      h="100vh"
      bg="gray.50"
      borderRight="1px solid"
      borderColor="gray.200"
      p={4}
      position="fixed"
      left={0}
      top={0}
      zIndex={10}
    >
      <VStack spacing={4} align="stretch">
        <Box mb={6}>
          <Heading size="md" color="blue.600">Admin Panel</Heading>
        </Box>
        
        <Button
          leftIcon={<Icon as={MdDashboard} />}
          variant={currentView === 'overview' ? 'solid' : 'ghost'}
          colorScheme="blue"
          justifyContent="flex-start"
          onClick={() => setCurrentView('overview')}
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

  // Render different views based on currentView
  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <Box bg={bgColor} minH="100vh">
            {/* Enhanced Header with Gradient */}
            <Box
              bgGradient="linear(to-r, blue.600, purple.600, pink.600)"
              color="white"
              py={6}
              px={8}
              boxShadow="lg"
            >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <HStack spacing={3}>
                <Icon as={MdAnalytics} boxSize={8} />
                <Heading size="xl" fontWeight="bold">
                  Enhanced Analytics Dashboard
                </Heading>
              </HStack>
              <Text fontSize="md" opacity={0.9}>
                Real-time insights and performance metrics • Last updated: {lastUpdated?.toLocaleTimeString()}
              </Text>
            </VStack>
            
            <HStack spacing={4}>
              <Button
                size="sm"
                variant="outline"
                color="white"
                borderColor="white"
                _hover={{ bg: "white", color: "blue.600" }}
                onClick={() => setAutoRefresh(!autoRefresh)}
                leftIcon={<Icon as={autoRefresh ? MdCheckCircle : MdRefresh} />}
              >
                Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              <Button
                size="sm"
                bg="white"
                color="blue.600"
                _hover={{ bg: "gray.100" }}
                onClick={fetchDashboardData}
                leftIcon={<Icon as={MdRefresh} />}
              >
                Refresh Now
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        {/* KPI Cards with Animations */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card bg={cardBg} borderColor={borderColor} _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }} transition="all 0.3s">
            <CardBody>
              <Stat>
                <StatLabel color={subTextColor}>Total Projects</StatLabel>
                <StatNumber color="blue.500" fontSize="3xl">{stats.summary.total_projects}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {stats.trends.projects_this_month} this month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }} transition="all 0.3s">
            <CardBody>
              <Stat>
                <StatLabel color={subTextColor}>Active Projects</StatLabel>
                <StatNumber color="green.500" fontSize="3xl">{stats.summary.active_projects}</StatNumber>
                <StatHelpText>
                  {((stats.summary.active_projects / stats.summary.total_projects) * 100).toFixed(1)}% of total
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }} transition="all 0.3s">
            <CardBody>
              <Stat>
                <StatLabel color={subTextColor}>Total Investment (EUR)</StatLabel>
                <StatNumber color="purple.500" fontSize="3xl">
                  {formatCurrency(stats.financial.total_cost_france, 'EUR')}
                </StatNumber>
                <StatHelpText>
                  Avg: {formatCurrency(stats.financial.avg_project_cost_france, 'EUR')} per project
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }} transition="all 0.3s">
            <CardBody>
              <Stat>
                <StatLabel color={subTextColor}>Total Investment (MAD)</StatLabel>
                <StatNumber color="orange.500" fontSize="3xl">
                  {formatCurrency(stats.financial.total_cost_morocco, 'MAD')}
                </StatNumber>
                <StatHelpText>
                  Avg: {formatCurrency(stats.financial.avg_project_cost_morocco, 'MAD')} per project
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Equipment Analytics with Icons */}
        <Card bg={cardBg} borderColor={borderColor} mb={8} _hover={{ boxShadow: 'xl' }} transition="all 0.3s">
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={MdComputer} boxSize={6} color="blue.500" />
              <Heading size="lg" color={textColor}>Equipment Analytics</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={6}>
              <VStack spacing={2}>
                <Icon as={MdComputer} boxSize={10} color="blue.500" />
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>{stats.equipment_analytics.total_laptops}</Text>
                <Text fontSize="sm" color={subTextColor}>Laptops</Text>
              </VStack>
              <VStack spacing={2}>
                <Icon as={MdComputer} boxSize={10} color="green.500" />
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>{stats.equipment_analytics.total_desktops}</Text>
                <Text fontSize="sm" color={subTextColor}>Desktops</Text>
              </VStack>
              <VStack spacing={2}>
                <Icon as={MdPrint} boxSize={10} color="purple.500" />
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>{stats.equipment_analytics.total_printers}</Text>
                <Text fontSize="sm" color={subTextColor}>Printers</Text>
              </VStack>
              <VStack spacing={2}>
                <Icon as={MdWifi} boxSize={10} color="orange.500" />
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>{stats.equipment_analytics.total_aps}</Text>
                <Text fontSize="sm" color={subTextColor}>Access Points</Text>
              </VStack>
              <VStack spacing={2}>
                <Icon as={MdVideocam} boxSize={10} color="red.500" />
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>{stats.equipment_analytics.total_videoconference}</Text>
                <Text fontSize="sm" color={subTextColor}>Video Conference</Text>
              </VStack>
              <VStack spacing={2}>
                <Icon as={MdRouter} boxSize={10} color="teal.500" />
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>{stats.equipment_analytics.total_network_equipment}</Text>
                <Text fontSize="sm" color={subTextColor}>Network Equipment</Text>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Enhanced Analytics Tabs */}
        <Tabs variant="enclosed" colorScheme="blue" size="lg">
          <TabList>
            <Tab _selected={{ color: 'blue.600', borderColor: 'blue.600' }}>
              <Icon as={MdAttachMoney} mr={2} />
              Financial Overview
            </Tab>
            <Tab _selected={{ color: 'blue.600', borderColor: 'blue.600' }}>
              <Icon as={MdBarChart} mr={2} />
              Project Analytics
            </Tab>
            <Tab _selected={{ color: 'blue.600', borderColor: 'blue.600' }}>
              <Icon as={MdTrendingUp} mr={2} />
              Equipment Trends
            </Tab>
            <Tab _selected={{ color: 'blue.600', borderColor: 'blue.600' }}>
              <Icon as={MdPieChart} mr={2} />
              Cost Analysis
            </Tab>
            <Tab _selected={{ color: 'blue.600', borderColor: 'blue.600' }}>
              <Icon as={MdAnalytics} mr={2} />
              Project Complexity
            </Tab>
          </TabList>

          <TabPanels>
            {/* Financial Overview Tab */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md" color={textColor}>Cost Efficiency Metrics</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <HStack justify="space-between" w="full">
                        <Text color={subTextColor}>Cost per User (EUR)</Text>
                        <Text fontWeight="bold" color={textColor}>{formatCurrency(stats.financial.avg_cost_per_user_france, 'EUR')}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text color={subTextColor}>Cost per User (MAD)</Text>
                        <Text fontWeight="bold" color={textColor}>{formatCurrency(stats.financial.avg_cost_per_user_morocco, 'MAD')}</Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between" w="full">
                        <Text color={subTextColor}>Total Users in Projects</Text>
                        <Text fontWeight="bold" color={textColor}>{stats.equipment_analytics.total_users_in_projects}</Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md" color={textColor}>Growth Metrics</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <HStack justify="space-between" w="full">
                        <Text color={subTextColor}>Projects This Month</Text>
                        <Badge colorScheme="green" fontSize="md" px={3} py={1}>{stats.trends.projects_this_month}</Badge>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text color={subTextColor}>Projects Last Month</Text>
                        <Badge colorScheme="blue" fontSize="md" px={3} py={1}>{stats.trends.projects_last_month}</Badge>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text color={subTextColor}>Growth Rate</Text>
                        <Badge colorScheme={stats.financial.project_growth_percentage >= 0 ? 'green' : 'red'} fontSize="md" px={3} py={1}>
                          {stats.financial.project_growth_percentage >= 0 ? '+' : ''}{stats.financial.project_growth_percentage}%
                        </Badge>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text color={subTextColor}>Recent User Activity</Text>
                        <Badge colorScheme="purple" fontSize="md" px={3} py={1}>{stats.trends.recent_user_activity} users</Badge>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Project Analytics Tab */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md" color={textColor}>Project Status Distribution</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      {Object.entries(stats.trends.project_status_distribution).map(([status, count]) => {
                        const percentage = (count / stats.summary.total_projects) * 100;
                        return (
                          <Box key={status} w="full">
                            <HStack justify="space-between" mb={2}>
                              <Text textTransform="capitalize" color={subTextColor}>{status.replace('_', ' ')}</Text>
                              <Text fontWeight="bold" color={textColor}>{count}</Text>
                            </HStack>
                            <Progress 
                              value={percentage} 
                              colorScheme={status === 'completed' ? 'green' : status === 'in_progress' ? 'blue' : 'gray'}
                              size="lg"
                              borderRadius="full"
                            />
                            <Text fontSize="xs" color={subTextColor} mt={1}>
                              {percentage.toFixed(1)}%
                            </Text>
                          </Box>
                        );
                      })}
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md" color={textColor}>Geographic Distribution</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3}>
                      {stats.geographic_distribution.entity_distribution.map((entity, index) => (
                        <HStack key={index} justify="space-between" w="full">
                          <Text color={subTextColor}>{entity.entity || 'Other'}</Text>
                          <Badge colorScheme="blue" fontSize="md" px={3} py={1}>{entity.count} projects</Badge>
                        </HStack>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Equipment Trends Tab */}
            <TabPanel px={0}>
              <Card bg={cardBg} borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md" color={textColor}>Most Used Equipment</Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                    <Box>
                      <Text fontWeight="bold" mb={3} color={textColor}>Network Equipment</Text>
                      <VStack spacing={2} align="stretch">
                        {stats.equipment_analytics.most_used_network_equipment.map((item, index) => (
                          <HStack key={index} justify="space-between">
                            <Text fontSize="sm" color={subTextColor}>{item.equipment__name}</Text>
                            <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>{item.total_quantity}</Badge>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb={3} color={textColor}>Server Equipment</Text>
                      <VStack spacing={2} align="stretch">
                        {stats.equipment_analytics.most_used_server_equipment.map((item, index) => (
                          <HStack key={index} justify="space-between">
                            <Text fontSize="sm" color={subTextColor}>{item.equipment__name}</Text>
                            <Badge colorScheme="green" fontSize="sm" px={2} py={1}>{item.total_quantity}</Badge>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  </SimpleGrid>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Cost Analysis Tab */}
            <TabPanel px={0}>
              <Card bg={cardBg} borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md" color={textColor}>Cost Analysis by Category</Heading>
                </CardHeader>
                <CardBody>
                  <TableContainer>
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th color={subTextColor}>Category</Th>
                          <Th isNumeric color={subTextColor}>Quantity</Th>
                          <Th isNumeric color={subTextColor}>Total (EUR)</Th>
                          <Th isNumeric color={subTextColor}>Total (MAD)</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {charts.cost_analysis_by_category.map((item, index) => (
                          <Tr key={index} _hover={{ bg: 'gray.50' }}>
                            <Td color={textColor}>{item.material__category__name}</Td>
                            <Td isNumeric color={textColor}>{item.total_quantity}</Td>
                            <Td isNumeric color={textColor}>{formatCurrency(item.total_cost_france, 'EUR')}</Td>
                            <Td isNumeric color={textColor}>{formatCurrency(item.total_cost_morocco, 'MAD')}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Project Complexity Tab */}
            <TabPanel px={0}>
              <Card bg={cardBg} borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md" color={textColor}>Most Complex Projects</Heading>
                </CardHeader>
                <CardBody>
                  <TableContainer>
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th color={subTextColor}>Project</Th>
                          <Th color={subTextColor}>Company</Th>
                          <Th isNumeric color={subTextColor}>Complexity Score</Th>
                          <Th isNumeric color={subTextColor}>Equipment</Th>
                          <Th isNumeric color={subTextColor}>Users</Th>
                          <Th isNumeric color={subTextColor}>Value (EUR)</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {charts.project_complexity_analysis.slice(0, 10).map((project, index) => (
                          <Tr key={index} _hover={{ bg: 'gray.50' }}>
                            <Td color={textColor}>{project.project_name}</Td>
                            <Td color={textColor}>{project.company_name}</Td>
                            <Td isNumeric>
                              <Badge colorScheme={project.complexity_score > 50 ? 'red' : project.complexity_score > 25 ? 'orange' : 'green'} fontSize="sm" px={2} py={1}>
                                {project.complexity_score}
                              </Badge>
                            </Td>
                            <Td isNumeric color={textColor}>{project.equipment_count}</Td>
                            <Td isNumeric color={textColor}>{project.user_count}</Td>
                            <Td isNumeric color={textColor}>{formatCurrency(project.total_value_france, 'EUR')}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
          </Box>
        );
      
      case 'users':
        return (
          <Box bg={bgColor} minH="100vh" p={8}>
            <Container maxW="container.xl">
              <Heading size="xl" mb={6}>Users Management</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {users.map((user) => (
                  <Card key={user.id} bg={cardBg}>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Heading size="md">{user.username}</Heading>
                          <Badge colorScheme={user.is_active ? 'green' : 'red'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </HStack>
                        <Text color={subTextColor}>{user.email}</Text>
                        <Badge colorScheme="blue" alignSelf="start">
                          {user.role}
                        </Badge>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </Container>
          </Box>
        );
      
      case 'projects':
        return (
          <Box bg={bgColor} minH="100vh" p={8}>
            <Container maxW="container.xl">
              <Heading size="xl" mb={6}>Projects Management</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {projects.map((project) => (
                  <Card key={project.id} bg={cardBg}>
                    <CardHeader>
                      <Heading size="md">{project.name}</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <Text color={subTextColor}>{project.description}</Text>
                        <HStack justify="space-between">
                          <Text><strong>Entity:</strong> {project.entity}</Text>
                          <Text><strong>Users:</strong> {project.number_of_users}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text><strong>Start:</strong> {project.start_date}</Text>
                          <Text><strong>End:</strong> {project.end_date}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text><strong>PC Type:</strong> {project.pc_type}</Text>
                          <Text><strong>Internet:</strong> {project.internet_line_type}</Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </Container>
          </Box>
        );
      
      case 'materials':
        return (
          <Box bg={bgColor} minH="100vh" p={8}>
            <Container maxW="container.xl">
              <Heading size="xl" mb={6}>Materials Management</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {materials.map((material) => (
                  <Card key={material.id} bg={cardBg}>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <Heading size="md">{material.name}</Heading>
                        {material.description && (
                          <Text color={subTextColor}>{material.description}</Text>
                        )}
                        <HStack justify="space-between">
                          <Text><strong>France:</strong> €{material.price_france}</Text>
                          <Text><strong>Morocco:</strong> {material.price_morocco} MAD</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Badge colorScheme="blue">{material.unit}</Badge>
                          {material.auto_calculate && (
                            <Badge colorScheme="green">Auto-calc</Badge>
                          )}
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </Container>
          </Box>
        );
      
      case 'categories':
        return (
          <Box bg={bgColor} minH="100vh" p={8}>
            <Container maxW="container.xl">
              <Heading size="xl" mb={6}>Categories Management</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {categories.map((category) => {
                  const categoryMaterials = materials.filter(m => m.category === category.id);
                  return (
                    <Card key={category.id} bg={cardBg}>
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <Heading size="md">{category.name}</Heading>
                          {category.description && (
                            <Text color={subTextColor}>{category.description}</Text>
                          )}
                          <HStack justify="space-between">
                            <Text><strong>Materials:</strong> {categoryMaterials.length}</Text>
                            <Badge colorScheme="blue">{categoryMaterials.length} items</Badge>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Container>
          </Box>
        );
      
      case 'settings':
        return (
          <Box bg={bgColor} minH="100vh" p={8}>
            <Container maxW="container.xl">
              <Heading size="xl" mb={6}>Settings</Heading>
              <Card>
                <CardHeader>
                  <Heading size="md">System Settings</Heading>
                </CardHeader>
                <CardBody>
                  <Text>Settings functionality coming soon...</Text>
                </CardBody>
              </Card>
            </Container>
          </Box>
        );
      
      default:
        return (
          <Box bg={bgColor} minH="100vh" p={8}>
            <Container maxW="container.xl">
              <Heading size="xl" mb={6}>Dashboard</Heading>
              <Text>Select a section from the sidebar to get started.</Text>
            </Container>
          </Box>
        );
    }
  };

  return (
    <Flex>
      <Sidebar />
      <Box flex="1" ml="250px">
        {renderView()}
      </Box>
    </Flex>
  );
};

export default EnhancedDashboard;
