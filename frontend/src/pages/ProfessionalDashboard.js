import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Avatar,
  Badge,
  IconButton,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
  List,
  ListItem,
  ListIcon,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  VStack,
  HStack,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  Textarea,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Icon,
  Grid
} from '@chakra-ui/react';
import {
  MdSearch,
  MdRefresh,
  MdAdd,
  MdTrendingUp,
  MdTrendingDown,
  MdBusiness,
  MdPeople,
  MdAttachMoney,
  MdAssessment,
  MdSchedule,
  MdCheckCircle,
  MdPending,
  MdWarning,
  MdFilterList,
  MdCalendarToday,
  MdClose
} from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';

const API_URL = 'http://127.0.0.1:8000/api/';

const ProfessionalDashboard = () => {
  const { authToken, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalUsers: 0,
    totalInvestment: 0,
    completionRate: 0,
    projectsThisWeek: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Modal state
  const { isOpen: isAddProjectOpen, onOpen: onAddProjectOpen, onClose: onAddProjectClose } = useDisclosure();
  const toast = useToast();
  
  // Form data for new project
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    entity: '',
    number_of_users: 1,
    budget: 0,
    status: 'planning',
    start_date: '',
    end_date: '',
    local_apps_enabled: false,
    pc_type_selection: 'BOTH'
  });
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [localAppsEnabled, setLocalAppsEnabled] = useState(false);
  const [pcTypeSelection, setPcTypeSelection] = useState('BOTH');

  // Chakra UI color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = {
        'Authorization': `Token ${authToken}`,
        'Content-Type': 'application/json',
      };

      // Add detailed logging before API calls
      console.log('About to make API calls with:', {
        apiUrl: API_URL,
        headers: headers,
        user: user
      });

      // Fetch all data in parallel
      const [projectsRes, usersRes, dashboardRes] = await Promise.all([
        axios.get(`${API_URL}projects/projects/`, { headers }),
        axios.get(`${API_URL}auth/users/`, { headers }),
        axios.get(`${API_URL}dashboard/stats/`, { headers }).catch(() => ({ data: {} }))
      ]);

      const projectsData = Array.isArray(projectsRes.data) ? projectsRes.data : 
                          Array.isArray(projectsRes.data.results) ? projectsRes.data.results : [];
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
      const dashboardData = dashboardRes.data;

      console.log('Dashboard data fetched:', {
        projects: projectsData.length,
        users: usersData.length,
        dashboard: dashboardData,
        rawProjects: projectsRes.data,
        projectsStatus: projectsRes.status,
        authToken: authToken ? 'Present' : 'Missing',
        user: user
      });

      setProjects(projectsData);
      setUsers(usersData);

      // If no projects found, show a helpful message
      if (projectsData.length === 0) {
        console.warn('No projects found in API response. This could mean:');
        console.warn('1. Django server is not running');
        console.warn('2. No projects exist in the database');
        console.warn('3. User permissions are not set correctly');
        console.warn('4. API endpoint is not working');
      }

      // Calculate stats
      const totalProjects = projectsData.length;
      const activeProjects = projectsData.filter(p => p.status === 'active' || p.status === 'in_progress').length;
      const totalUsers = usersData.length;
      const totalInvestment = projectsData.reduce((sum, p) => sum + (parseFloat(p.total_cost_france) || 0), 0);
      const completionRate = totalProjects > 0 ? Math.round((projectsData.filter(p => p.status === 'completed').length / totalProjects) * 100) : 0;
      
      // Calculate projects created this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const projectsThisWeek = projectsData.filter(project => {
        const createdDate = new Date(project.created_at);
        return createdDate >= oneWeekAgo;
      }).length;

      setStats({
        totalProjects,
        activeProjects,
        totalUsers,
        totalInvestment,
        completionRate,
        projectsThisWeek
      });

      setLastUpdated(new Date());
      setError(null);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        authToken: authToken ? 'Present' : 'Missing'
      });
      setError('Failed to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Form handling functions
  const clearAddForm = () => {
    // Clear all form fields
    const fields = [
      'project-name', 'number-of-users', 'start-date', 'end-date',
      'num-laptop-office', 'num-laptop-tech', 'num-desktop-office', 'num-desktop-tech',
      'num-printers', 'num-aps', 'num-videoconference', 'num-traceau',
      'local-apps-list', 'site-addresses', 'gps-coordinates'
    ];
    
    fields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) element.value = '';
    });
    
    // Reset select fields
    const entitySelect = document.getElementById('entity');
    const pcTypeSelect = document.getElementById('pc-type');
    const localAppsSelect = document.getElementById('local-apps');
    const fileServerSelect = document.getElementById('file-server');
    const internetTypeSelect = document.getElementById('internet-line-type');
    const internetSpeedSelect = document.getElementById('internet-line-speed');
    
    if (entitySelect) entitySelect.value = 'OTHER';
    if (pcTypeSelect) pcTypeSelect.value = 'BOTH';
    if (localAppsSelect) localAppsSelect.value = 'false';
    if (fileServerSelect) fileServerSelect.value = 'false';
    if (internetTypeSelect) internetTypeSelect.value = 'FO';
    if (internetSpeedSelect) internetSpeedSelect.value = '100MBps';
    
    // Reset state variables
    setLocalAppsEnabled(false);
    setPcTypeSelection('BOTH');
  };

  const handleCreateProject = async () => {
    setIsCreatingProject(true);
    try {
      // Helper function to safely get element value
      const getElementValue = (id, defaultValue = '') => {
        const element = document.getElementById(id);
        return element ? element.value : defaultValue;
      };

      const getElementValueAsNumber = (id, defaultValue = 0) => {
        const element = document.getElementById(id);
        return element ? parseInt(element.value) || defaultValue : defaultValue;
      };

      // Collect all form data
      const projectData = {
        name: getElementValue('project-name'),
        entity: getElementValue('entity'),
        number_of_users: getElementValueAsNumber('number-of-users', 1),
        start_date: getElementValue('start-date'),
        end_date: getElementValue('end-date'),
        pc_type_selection: getElementValue('pc-type'),
        local_apps_enabled: getElementValue('local-apps') === 'true',
        local_apps_list: getElementValue('local-apps-list'),
        file_server: getElementValue('file-server') === 'true',
        site_addresses: getElementValue('site-addresses'),
        gps_coordinates: getElementValue('gps-coordinates'),
        internet_line_type: getElementValue('internet-line-type'),
        internet_line_speed: getElementValue('internet-line-speed'),
        num_laptop_office: getElementValueAsNumber('num-laptop-office'),
        num_laptop_tech: getElementValueAsNumber('num-laptop-tech'),
        num_desktop_office: getElementValueAsNumber('num-desktop-office'),
        num_desktop_tech: getElementValueAsNumber('num-desktop-tech'),
        num_printers: getElementValueAsNumber('num-printers'),
        num_traceau: getElementValueAsNumber('num-traceau'),
        num_videoconference: getElementValueAsNumber('num-videoconference'),
        num_aps: getElementValueAsNumber('num-aps'),
        user: user.id,
        status: 'draft'
      };

      console.log('Creating project with data:', projectData);

      // Check if user is authenticated
      if (!authToken) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to create projects.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // First create the project with basic info
      console.log('Creating project with basic info...');
      console.log('POST URL:', `${API_URL}projects/projects/`);
      console.log('Auth token:', authToken);
      
      let createResponse;
      try {
        createResponse = await axios.post(`${API_URL}projects/projects/`, {
          name: projectData.name,
          company_name: '' // Set empty company name as per backend requirements
        }, {
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Create response:', createResponse.data);
        console.log('Create response status:', createResponse.status);
        console.log('Create response headers:', createResponse.headers);
        console.log('Response data keys:', Object.keys(createResponse.data));
      } catch (createError) {
        console.error('Create project error:', createError);
        console.error('Create error response:', createError.response?.data);
        console.error('Create error status:', createError.response?.status);
        throw createError;
      }

      const projectId = createResponse.data.id;
      console.log('Project ID:', projectId);
      console.log('Project ID type:', typeof projectId);

      if (!projectId) {
        throw new Error('Project creation failed: No project ID returned');
      }

      // Then update with detailed information
      console.log('Updating project with detailed information...');
      const updateResponse = await axios.patch(`${API_URL}projects/projects/${projectId}/`, projectData, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Project created successfully:', updateResponse.data);

      toast({
        title: 'Project Created Successfully!',
        description: `Project "${projectData.name}" has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh dashboard data
      await fetchDashboardData();
      
      // Close modal and clear form
      clearAddForm();
      onAddProjectClose();

    } catch (error) {
      console.error('Error creating project:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error response:', JSON.stringify(error.response?.data, null, 2));
      
      // Extract validation errors
      let errorMessage = 'An error occurred while creating the project.';
      if (error.response?.data) {
        if (error.response.data.status && Array.isArray(error.response.data.status)) {
          errorMessage = error.response.data.status.join(', ');
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      }
      
      toast({
        title: 'Error Creating Project',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreatingProject(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchDashboardData();
    }
  }, [authToken]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active':
      case 'in_progress': return 'primary';
      case 'pending': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <MdCheckCircle />;
      case 'active':
      case 'in_progress': return <MdTrendingUp />;
      case 'pending': return <MdPending />;
      case 'draft': return <MdWarning />;
      default: return <MdSchedule />;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        project.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
    <Card 
      bg={`${color}.500`} 
      color="white" 
      borderRadius="xl" 
      boxShadow="xl"
      position="relative"
      overflow="hidden"
      _hover={{ transform: 'translateY(-2px)', boxShadow: '2xl' }}
      transition="all 0.3s ease"
    >
      <Box
        position="absolute"
        top="-20px"
        right="-20px"
        width="80px"
        height="80px"
        bg="whiteAlpha.200"
        borderRadius="full"
      />
      <CardBody position="relative" zIndex={1}>
        <Flex align="center" justify="space-between" mb={4}>
          <Avatar bg="whiteAlpha.200" color="white" size="md">
            {icon}
          </Avatar>
          {trend && (
            <Badge 
              bg="whiteAlpha.200" 
              color="white"
              borderRadius="full"
              px={2}
              py={1}
            >
              <HStack spacing={1}>
                {trend > 0 ? <MdTrendingUp /> : <MdTrendingDown />}
                <Text fontSize="xs">
                  {trend > 0 ? '+' : ''}{trend}%
                </Text>
              </HStack>
            </Badge>
          )}
        </Flex>
        <Heading size="xl" mb={2} fontWeight="bold">
          {value}
        </Heading>
        <Text fontSize="sm" opacity={0.9}>
          {title}
        </Text>
        {subtitle && (
          <Text fontSize="xs" opacity={0.8} mt={2}>
            {subtitle}
          </Text>
        )}
      </CardBody>
    </Card>
  );

  const ProjectCard = ({ project, index }) => (
    <Card 
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="lg"
      boxShadow="sm"
      _hover={{ 
        transform: 'translateY(-1px)',
        boxShadow: 'md',
        borderColor: 'blue.300'
      }}
      transition="all 0.2s ease"
      position="relative"
      overflow="hidden"
      mb={3}
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        h="3px"
        bgGradient={`linear(to-r, ${['blue', 'purple', 'green', 'orange'][index % 4]}.400, ${['blue', 'purple', 'green', 'orange'][index % 4]}.600)`}
      />
      <CardBody p={4}>
        <Flex align="center" justify="space-between" mb={3}>
          <Flex align="center">
            <Avatar 
              bg={`${['blue', 'purple', 'green', 'orange'][index % 4]}.500`}
              mr={3}
              size="md"
              fontWeight="bold"
              fontSize="sm"
            >
              {project.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Heading size="sm" fontWeight="bold" color="gray.800" mb={1}>
                {project.name}
              </Heading>
              <Text color={mutedTextColor} fontSize="xs" fontWeight="500">
                {project.company_name || 'No Company'}
              </Text>
            </Box>
          </Flex>
        </Flex>

        <SimpleGrid columns={2} spacing={3} mb={3}>
          <Box textAlign="center" bg="blue.50" borderRadius="md" p={2}>
            <Text fontSize="lg" color="blue.600" fontWeight="bold">
              {project.number_of_users || 0}
            </Text>
            <Text fontSize="xs" color="blue.500" fontWeight="500">
              Users
            </Text>
          </Box>
          <Box textAlign="center" bg="green.50" borderRadius="md" p={2}>
            <Text fontSize="lg" color="green.600" fontWeight="bold">
              €{(project.total_cost_france || 0).toLocaleString()}
            </Text>
            <Text fontSize="xs" color="green.500" fontWeight="500">
              Investment
            </Text>
          </Box>
        </SimpleGrid>

        <Flex align="center" justify="flex-end">
          <Text fontSize="xs" color={mutedTextColor} fontWeight="400">
            {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
          </Text>
        </Flex>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" minH="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Heading size="md">
              Loading Dashboard...
            </Heading>
          </VStack>
        </Flex>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
        <Button 
          colorScheme="blue" 
          onClick={fetchDashboardData} 
          leftIcon={<MdRefresh />}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      {/* Header */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
          </Box>
          <HStack spacing={4}>
          </HStack>
        </Flex>

        {/* Search and Filter */}
        <Card bg={cardBg} borderColor={borderColor} p={4} mb={6}>
          <Flex align="center" gap={4}>
            <InputGroup flex={1}>
              <InputLeftElement pointerEvents="none">
                <MdSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="white"
              />
            </InputGroup>
          </Flex>
        </Card>
      </Box>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} spacing={6} mb={8}>
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<MdBusiness />}
          color="blue"
          trend={12}
          subtitle={`${stats.activeProjects} active`}
        />
        <StatCard
          title="This Week"
          value={stats.projectsThisWeek}
          icon={<MdCalendarToday />}
          color="green"
          trend={8}
          subtitle="Projects created"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<MdPeople />}
          color="purple"
          trend={15}
          subtitle="Registered users"
        />
        <StatCard
          title="Total Investment"
          value={`€${stats.totalInvestment.toLocaleString()}`}
          icon={<MdAttachMoney />}
          color="orange"
          trend={22}
          subtitle="Across all projects"
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={<MdAssessment />}
          color="teal"
          trend={5}
          subtitle="Project success rate"
        />
      </SimpleGrid>

      {/* Quick Actions Section - Now Above Projects */}
      <Box mb={8}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3}>
          <Box
            bg="blue.50"
            border="2px solid"
            borderColor="blue.200"
            borderRadius="lg"
            p={3}
            _hover={{ 
              bg: "blue.100", 
              borderColor: "blue.300",
              transform: "translateY(-1px)",
              boxShadow: "md"
            }}
            transition="all 0.2s ease"
            cursor="pointer"
            onClick={onAddProjectOpen}
          >
            <Flex align="center" justify="space-between">
              <HStack spacing={2}>
                <Avatar bg="blue.500" color="white" size="sm">
                  <MdAdd />
                </Avatar>
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="blue.700">
                    Add Project
                  </Text>
                  <Text fontSize="xs" color="blue.600">
                    Manage projects
                  </Text>
                </Box>
              </HStack>
              <Box color="blue.500">
                <MdAdd size={16} />
              </Box>
            </Flex>
          </Box>
          
          <Box
            bg="green.50"
            border="2px solid"
            borderColor="green.200"
            borderRadius="lg"
            p={3}
            _hover={{ 
              bg: "green.100", 
              borderColor: "green.300",
              transform: "translateY(-1px)",
              boxShadow: "md"
            }}
            transition="all 0.2s ease"
            cursor="pointer"
          >
            <Flex align="center" justify="space-between">
              <HStack spacing={2}>
                <Avatar bg="green.500" color="white" size="sm">
                  <MdAssessment />
                </Avatar>
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="green.700">
                    Generate Report
                  </Text>
                  <Text fontSize="xs" color="green.600">
                    Export data
                  </Text>
                </Box>
              </HStack>
              <Box color="green.500">
                <MdAssessment size={16} />
              </Box>
            </Flex>
          </Box>
          
          <Box
            bg="purple.50"
            border="2px solid"
            borderColor="purple.200"
            borderRadius="lg"
            p={3}
            _hover={{ 
              bg: "purple.100", 
              borderColor: "purple.300",
              transform: "translateY(-1px)",
              boxShadow: "md"
            }}
            transition="all 0.2s ease"
            cursor="pointer"
          >
            <Flex align="center" justify="space-between">
              <HStack spacing={2}>
                <Avatar bg="purple.500" color="white" size="sm">
                  <MdPeople />
                </Avatar>
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="purple.700">
                    Manage Users
                  </Text>
                  <Text fontSize="xs" color="purple.600">
                    User admin
                  </Text>
                </Box>
              </HStack>
              <Box color="purple.500">
                <MdPeople size={16} />
              </Box>
            </Flex>
          </Box>
          
          <Box
            bg="orange.50"
            border="2px solid"
            borderColor="orange.200"
            borderRadius="lg"
            p={3}
            _hover={{ 
              bg: "orange.100", 
              borderColor: "orange.300",
              transform: "translateY(-1px)",
              boxShadow: "md"
            }}
            transition="all 0.2s ease"
            cursor="pointer"
          >
            <Flex align="center" justify="space-between">
              <HStack spacing={2}>
                <Avatar bg="orange.500" color="white" size="sm">
                  <MdAttachMoney />
                </Avatar>
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="orange.700">
                    Budget Analysis
                  </Text>
                  <Text fontSize="xs" color="orange.600">
                    Financial
                  </Text>
                </Box>
              </HStack>
              <Box color="orange.500">
                <MdAttachMoney size={16} />
              </Box>
            </Flex>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Projects Section */}
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg" fontWeight="bold" color="gray.800">
            Projects
          </Heading>
          <Text color="gray.500" fontSize="sm">
            {filteredProjects.length} projects
          </Text>
        </Flex>
        
        {filteredProjects.length === 0 ? (
          <Box textAlign="center" py={16} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200">
            <Box
              w={16}
              h={16}
              bg="gray.100"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={4}
            >
              <MdBusiness size={32} color="gray.400" />
            </Box>
            <Heading size="md" color="gray.600" mb={2}>
              No projects found
            </Heading>
            <Text color="gray.500" fontSize="sm" mb={6}>
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'Create your first project to get started'
              }
            </Text>
            {!searchTerm && filterStatus === 'all' && (
              <Button
                colorScheme="blue"
                leftIcon={<MdAdd />}
                size="md"
                borderRadius="lg"
                onClick={() => navigate('/projects/new')}
              >
                Create Project
              </Button>
            )}
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredProjects.map((project, index) => (
              <Box
                key={project.id}
                bg="white"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.200"
                p={6}
                _hover={{ 
                  borderColor: "blue.300",
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
                transition="all 0.3s ease"
                cursor="pointer"
              >
                <Flex align="center" justify="space-between" mb={4}>
                  <Flex align="center">
                    <Avatar 
                      bg={`${['blue', 'purple', 'green', 'orange'][index % 4]}.500`}
                      mr={3}
                      size="md"
                    >
                      {project.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Heading size="sm" fontWeight="bold" color="gray.800" mb={1}>
                        {project.name}
                      </Heading>
                      <Text color="gray.500" fontSize="xs">
                        {project.company_name || 'No Company'}
                      </Text>
                    </Box>
                  </Flex>
                </Flex>

                <SimpleGrid columns={2} spacing={4} mb={4}>
                  <Box textAlign="center" bg="blue.50" borderRadius="lg" p={3}>
                    <Text fontSize="lg" color="blue.600" fontWeight="bold">
                      {project.number_of_users || 0}
                    </Text>
                    <Text fontSize="xs" color="blue.500">
                      Users
                    </Text>
                  </Box>
                  <Box textAlign="center" bg="green.50" borderRadius="lg" p={3}>
                    <Text fontSize="lg" color="green.600" fontWeight="bold">
                      €{(project.total_cost_france || 0).toLocaleString()}
                    </Text>
                    <Text fontSize="xs" color="green.500">
                      Investment
                    </Text>
                  </Box>
                </SimpleGrid>

                <Flex align="center" justify="flex-end">
                  <Text fontSize="xs" color="gray.500">
                    {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                  </Text>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Add Project Modal */}
      <Modal isOpen={isAddProjectOpen} onClose={onAddProjectClose} size="6xl">
        <ModalOverlay 
          bg="rgba(0,0,0,0.8)" 
          backdropFilter="blur(12px)"
        />
        <ModalContent 
          maxW="90vw" 
          maxH="95vh" 
          overflowY="auto"
          borderRadius="3xl"
          boxShadow="0 32px 64px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)"
          bg="linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)"
          border="2px solid"
          borderColor="rgba(255, 107, 53, 0.2)"
          position="relative"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #FF6B35 0%, #20B2AA 50%, #FF6B35 100%)",
            borderRadius: "3xl 3xl 0 0"
          }}
        >
          <ModalHeader 
            bg="transparent"
            borderBottom="none"
            p={8}
            position="relative"
          >
            <Flex justify="space-between" align="center" w="full">
              <HStack spacing={6} align="center">
                <Box
                  p={4}
                  borderRadius="2xl"
                  bg="linear-gradient(135deg, #FF6B35 0%, #20B2AA 100%)"
                  boxShadow="0 12px 35px rgba(255, 107, 53, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)"
                  position="relative"
                  _before={{
                    content: '""',
                    position: "absolute",
                    inset: "-2px",
                    borderRadius: "2xl",
                    background: "linear-gradient(135deg, #FF6B35 0%, #20B2AA 100%)",
                    zIndex: -1,
                    opacity: 0.3,
                    filter: "blur(8px)"
                  }}
                >
                  <Icon as={MdAdd} w="28px" h="28px" color="white" />
                </Box>
                <VStack align="start" spacing={2}>
                  <Heading 
                    size="xl" 
                    color="gray.800" 
                    fontWeight="800"
                    bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
                    bgClip="text"
                    textShadow="0 2px 4px rgba(0,0,0,0.1)"
                  >
                    Create New Project
                  </Heading>
                  <Text fontSize="md" color="gray.600" fontWeight="500">
                    🚀 Build your infrastructure project with precision
                  </Text>
                </VStack>
              </HStack>
              <IconButton
                aria-label="Close"
                icon={<Icon as={MdClose} />}
                size="md"
                variant="ghost"
                color="gray.500"
                _hover={{ 
                  bg: "rgba(255, 107, 53, 0.1)", 
                  color: "#FF6B35",
                  transform: "scale(1.1)"
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                borderRadius="xl"
                onClick={onAddProjectClose}
              />
            </Flex>
          </ModalHeader>

          <ModalBody p={8} bg="transparent">
            <VStack spacing={8} align="stretch">
              {/* 🎯 PROJECT FOUNDATION SECTION */}
              <Box
                p={6}
                borderRadius="2xl"
                bg="linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(32, 178, 170, 0.05) 100%)"
                border="2px solid"
                borderColor="rgba(255, 107, 53, 0.1)"
                position="relative"
                _before={{
                  content: '"🎯"',
                  position: "absolute",
                  top: "-12px",
                  left: "24px",
                  bg: "white",
                  px: 3,
                  py: 1,
                  borderRadius: "full",
                  fontSize: "lg",
                  fontWeight: "bold"
                }}
              >
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="gray.800" fontWeight="700" mb={2}>
                    Project Foundation
                  </Heading>
                  
                  {/* Project Name */}
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                      Project Name *
                    </Text>
                    <Input
                      id="project-name"
                      placeholder="Enter your project name"
                      size="lg"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      bg="white"
                      _focus={{
                        borderColor: "#FF6B35",
                        boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)",
                        bg: "white"
                      }}
                      _hover={{
                        borderColor: "gray.300"
                      }}
                      transition="all 0.3s ease"
                    />
                  </Box>

                  {/* Entity */}
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                      Entity *
                    </Text>
                    <Select
                      id="entity"
                      defaultValue="OTHER"
                      size="lg"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      bg="white"
                      _focus={{
                        borderColor: "#FF6B35",
                        boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                      }}
                      _hover={{
                        borderColor: "gray.300"
                      }}
                      transition="all 0.3s ease"
                    >
                      <option value="BOUYGUES_CONSTRUCTION">Bouygues Construction</option>
                      <option value="BOUYGUES_IMMOBILIER">Bouygues Immobilier</option>
                      <option value="COLAS">Colas</option>
                      <option value="TF1">TF1</option>
                      <option value="BOUYGUES_ENERGIES_SERVICES">Bouygues Energies & Services</option>
                      <option value="EQUANS">Equans</option>
                      <option value="BOUYGUES_TELECOM">Bouygues Telecom</option>
                      <option value="BOUYGUES_SA">Bouygues SA (Holding)</option>
                      <option value="OTHER">Other</option>
                    </Select>
                  </Box>

                  {/* Start Date and End Date */}
                  <HStack spacing={4}>
                    <Box flex={1}>
                      <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                        Start Date
                      </Text>
                      <Input
                        id="start-date"
                        type="date"
                        size="lg"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.200"
                        bg="white"
                        _focus={{
                          borderColor: "#FF6B35",
                          boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                        }}
                        _hover={{
                          borderColor: "gray.300"
                        }}
                        transition="all 0.3s ease"
                      />
                    </Box>
                    <Box flex={1}>
                      <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                        End Date
                      </Text>
                      <Input
                        id="end-date"
                        type="date"
                        size="lg"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.200"
                        bg="white"
                        _focus={{
                          borderColor: "#FF6B35",
                          boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                        }}
                        _hover={{
                          borderColor: "gray.300"
                        }}
                        transition="all 0.3s ease"
                      />
                    </Box>
                  </HStack>

                  {/* Number of Users */}
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                      Number of Users *
                    </Text>
                    <Input
                      id="number-of-users"
                      type="number"
                      placeholder="Enter number of users"
                      size="lg"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      bg="white"
                      _focus={{
                        borderColor: "#FF6B35",
                        boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                      }}
                      _hover={{
                        borderColor: "gray.300"
                      }}
                      transition="all 0.3s ease"
                    />
                  </Box>
                </VStack>
              </Box>

              {/* 💻 PC CONFIGURATION SECTION */}
              <Box
                p={6}
                borderRadius="2xl"
                bg="linear-gradient(135deg, rgba(32, 178, 170, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)"
                border="2px solid"
                borderColor="rgba(32, 178, 170, 0.1)"
                position="relative"
                _before={{
                  content: '"💻"',
                  position: "absolute",
                  top: "-12px",
                  left: "24px",
                  bg: "white",
                  px: 3,
                  py: 1,
                  borderRadius: "full",
                  fontSize: "lg",
                  fontWeight: "bold"
                }}
              >
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="gray.800" fontWeight="700" mb={2}>
                    PC Configuration
                  </Heading>
                  
                  {/* PC Type */}
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                      PC Type
                    </Text>
                    <Select
                      id="pc-type"
                      defaultValue="BOTH"
                      size="lg"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      bg="white"
                      _focus={{
                        borderColor: "#20B2AA",
                        boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                      }}
                      _hover={{
                        borderColor: "gray.300"
                      }}
                      transition="all 0.3s ease"
                      onChange={(e) => setPcTypeSelection(e.target.value)}
                    >
                      <option value="LAPTOP_ONLY">Laptop Only</option>
                      <option value="DESKTOP_ONLY">Desktop Only</option>
                      <option value="BOTH">Both</option>
                    </Select>
                  </Box>

                  {/* Device Quantities - Conditional based on PC Type */}
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="gray.700" mb={4}>
                      Device Quantities
                    </Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      {/* Laptop Office - Show if LAPTOP_ONLY or BOTH */}
                      {(pcTypeSelection === 'LAPTOP_ONLY' || pcTypeSelection === 'BOTH') && (
                        <Box>
                          <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                            💻 Laptop Office
                          </Text>
                          <Input
                            id="num-laptop-office"
                            type="number"
                            placeholder="0"
                            size="md"
                            borderRadius="xl"
                            border="2px solid"
                            borderColor="gray.200"
                            bg="white"
                            _focus={{
                              borderColor: "#20B2AA",
                              boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                            }}
                            _hover={{
                              borderColor: "gray.300"
                            }}
                            transition="all 0.3s ease"
                          />
                        </Box>
                      )}
                      
                      {/* Laptop Technical - Show if LAPTOP_ONLY or BOTH */}
                      {(pcTypeSelection === 'LAPTOP_ONLY' || pcTypeSelection === 'BOTH') && (
                        <Box>
                          <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                            🔧 Laptop Technical
                          </Text>
                          <Input
                            id="num-laptop-tech"
                            type="number"
                            placeholder="0"
                            size="md"
                            borderRadius="xl"
                            border="2px solid"
                            borderColor="gray.200"
                            bg="white"
                            _focus={{
                              borderColor: "#20B2AA",
                              boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                            }}
                            _hover={{
                              borderColor: "gray.300"
                            }}
                            transition="all 0.3s ease"
                          />
                        </Box>
                      )}
                      
                      {/* Desktop Office - Show if DESKTOP_ONLY or BOTH */}
                      {(pcTypeSelection === 'DESKTOP_ONLY' || pcTypeSelection === 'BOTH') && (
                        <Box>
                          <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                            🖥️ Desktop Office
                          </Text>
                          <Input
                            id="num-desktop-office"
                            type="number"
                            placeholder="0"
                            size="md"
                            borderRadius="xl"
                            border="2px solid"
                            borderColor="gray.200"
                            bg="white"
                            _focus={{
                              borderColor: "#20B2AA",
                              boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                            }}
                            _hover={{
                              borderColor: "gray.300"
                            }}
                            transition="all 0.3s ease"
                          />
                        </Box>
                      )}
                      
                      {/* Desktop Technical - Show if DESKTOP_ONLY or BOTH */}
                      {(pcTypeSelection === 'DESKTOP_ONLY' || pcTypeSelection === 'BOTH') && (
                        <Box>
                          <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                            ⚙️ Desktop Technical
                          </Text>
                          <Input
                            id="num-desktop-tech"
                            type="number"
                            placeholder="0"
                            size="md"
                            borderRadius="xl"
                            border="2px solid"
                            borderColor="gray.200"
                            bg="white"
                            _focus={{
                              borderColor: "#20B2AA",
                              boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                            }}
                            _hover={{
                              borderColor: "gray.300"
                            }}
                            transition="all 0.3s ease"
                          />
                        </Box>
                      )}
                    </Grid>
                  </Box>
                </VStack>
              </Box>

              {/* 🏢 APPLICATIONS & INFRASTRUCTURE SECTION */}
              <Box
                p={6}
                borderRadius="2xl"
                bg="linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(32, 178, 170, 0.05) 100%)"
                border="2px solid"
                borderColor="rgba(255, 107, 53, 0.1)"
                position="relative"
                _before={{
                  content: '"🏢"',
                  position: "absolute",
                  top: "-12px",
                  left: "24px",
                  bg: "white",
                  px: 3,
                  py: 1,
                  borderRadius: "full",
                  fontSize: "lg",
                  fontWeight: "bold"
                }}
              >
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="gray.800" fontWeight="700" mb={2}>
                    Applications & Infrastructure
                  </Heading>
                  
                  {/* Local Applications */}
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                      Are there local applications?
                    </Text>
                    <Select
                      id="local-apps"
                      defaultValue="false"
                      size="lg"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      bg="white"
                      _focus={{
                        borderColor: "#FF6B35",
                        boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                      }}
                      _hover={{
                        borderColor: "gray.300"
                      }}
                      transition="all 0.3s ease"
                      onChange={(e) => setLocalAppsEnabled(e.target.value === 'true')}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </Select>
                  </Box>

                  {/* Local Applications List - Conditional */}
                  {localAppsEnabled && (
                    <Box
                      p={4}
                      borderRadius="xl"
                      bg="rgba(255, 107, 53, 0.05)"
                      border="2px solid"
                      borderColor="rgba(255, 107, 53, 0.2)"
                      animation="slideIn 0.3s ease-out"
                    >
                      <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                        Which ones? (Example: SAGE, GMAO)
                      </Text>
                      <Input
                        id="local-apps-list"
                        placeholder="Enter local applications (e.g., SAGE, GMAO)"
                        size="lg"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.200"
                        bg="white"
                        _focus={{
                          borderColor: "#FF6B35",
                          boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                        }}
                        _hover={{
                          borderColor: "gray.300"
                        }}
                        transition="all 0.3s ease"
                      />
                    </Box>
                  )}

                  {/* File Server */}
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                      File Server?
                    </Text>
                    <Select
                      id="file-server"
                      defaultValue="false"
                      size="lg"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      bg="white"
                      _focus={{
                        borderColor: "#FF6B35",
                        boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                      }}
                      _hover={{
                        borderColor: "gray.300"
                      }}
                      transition="all 0.3s ease"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </Select>
                  </Box>
                </VStack>
              </Box>

              {/* 🌐 LOCATION & CONNECTIVITY SECTION */}
              <Box
                p={6}
                borderRadius="2xl"
                bg="linear-gradient(135deg, rgba(32, 178, 170, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)"
                border="2px solid"
                borderColor="rgba(32, 178, 170, 0.1)"
                position="relative"
                _before={{
                  content: '"🌐"',
                  position: "absolute",
                  top: "-12px",
                  left: "24px",
                  bg: "white",
                  px: 3,
                  py: 1,
                  borderRadius: "full",
                  fontSize: "lg",
                  fontWeight: "bold"
                }}
              >
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="gray.800" fontWeight="700" mb={2}>
                    Location & Connectivity
                  </Heading>
                  
                  {/* Site Addresses */}
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                      Addresses of each site/workshop
                    </Text>
                    <Textarea
                      id="site-addresses"
                      placeholder="Enter site addresses (one per line)"
                      size="lg"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      bg="white"
                      rows={3}
                      resize="vertical"
                      _focus={{
                        borderColor: "#20B2AA",
                        boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                      }}
                      _hover={{
                        borderColor: "gray.300"
                      }}
                      transition="all 0.3s ease"
                    />
                  </Box>

                  {/* GPS Coordinates */}
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                      GPS Coordinates (Example: 24.793387, 46.654397)
                    </Text>
                    <Input
                      id="gps-coordinates"
                      placeholder="Enter GPS coordinates (e.g., 24.793387, 46.654397)"
                      size="lg"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      bg="white"
                      _focus={{
                        borderColor: "#20B2AA",
                        boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                      }}
                      _hover={{
                        borderColor: "gray.300"
                      }}
                      transition="all 0.3s ease"
                    />
                  </Box>

                  {/* Internet Line */}
                  <HStack spacing={4}>
                    <Box flex={1}>
                      <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                        Internet Line Type
                      </Text>
                      <Select
                        id="internet-line-type"
                        defaultValue="FO"
                        size="lg"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.200"
                        bg="white"
                        _focus={{
                          borderColor: "#20B2AA",
                          boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                        }}
                        _hover={{
                          borderColor: "gray.300"
                        }}
                        transition="all 0.3s ease"
                      >
                        <option value="FO">FO</option>
                        <option value="VSAT">VSAT</option>
                        <option value="STARLINK">STARLINK</option>
                        <option value="OTHER">OTHER</option>
                      </Select>
                    </Box>
                    <Box flex={1}>
                      <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                        Internet Line Speed
                      </Text>
                      <Select
                        id="internet-line-speed"
                        defaultValue="100MBps"
                        size="lg"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.200"
                        bg="white"
                        _focus={{
                          borderColor: "#20B2AA",
                          boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                        }}
                        _hover={{
                          borderColor: "gray.300"
                        }}
                        transition="all 0.3s ease"
                      >
                        <option value="100MBps">100MBps</option>
                        <option value="200MB">200MB</option>
                        <option value="500MB">500MB</option>
                        <option value="1GB">1GB</option>
                      </Select>
                    </Box>
                  </HStack>
                </VStack>
              </Box>

              {/* 🖨️ ADDITIONAL EQUIPMENT SECTION */}
              <Box
                p={6}
                borderRadius="2xl"
                bg="linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(32, 178, 170, 0.05) 100%)"
                border="2px solid"
                borderColor="rgba(255, 107, 53, 0.1)"
                position="relative"
                _before={{
                  content: '"🖨️"',
                  position: "absolute",
                  top: "-12px",
                  left: "24px",
                  bg: "white",
                  px: 3,
                  py: 1,
                  borderRadius: "full",
                  fontSize: "lg",
                  fontWeight: "bold"
                }}
              >
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="gray.800" fontWeight="700" mb={2}>
                    Additional Equipment
                  </Heading>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <Box>
                      <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                        🖨️ Number of Printers
                      </Text>
                      <Input
                        id="num-printers"
                        type="number"
                        placeholder="0"
                        size="md"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.200"
                        bg="white"
                        _focus={{
                          borderColor: "#FF6B35",
                          boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                        }}
                        _hover={{
                          borderColor: "gray.300"
                        }}
                        transition="all 0.3s ease"
                      />
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                        📐 Number of Traceau
                      </Text>
                      <Input
                        id="num-traceau"
                        type="number"
                        placeholder="0"
                        size="md"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.200"
                        bg="white"
                        _focus={{
                          borderColor: "#FF6B35",
                          boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                        }}
                        _hover={{
                          borderColor: "gray.300"
                        }}
                        transition="all 0.3s ease"
                      />
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                        📹 Number of Videoconference
                      </Text>
                      <Input
                        id="num-videoconference"
                        type="number"
                        placeholder="0"
                        size="md"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.200"
                        bg="white"
                        _focus={{
                          borderColor: "#FF6B35",
                          boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                        }}
                        _hover={{
                          borderColor: "gray.300"
                        }}
                        transition="all 0.3s ease"
                      />
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                        📶 Number of AP
                      </Text>
                      <Input
                        id="num-aps"
                        type="number"
                        placeholder="0"
                        size="md"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.200"
                        bg="white"
                        _focus={{
                          borderColor: "#FF6B35",
                          boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                        }}
                        _hover={{
                          borderColor: "gray.300"
                        }}
                        transition="all 0.3s ease"
                      />
                    </Box>
                  </Grid>
                </VStack>
              </Box>

              {/* 🚀 ACTION BUTTONS SECTION */}
              <Box
                p={6}
                borderRadius="2xl"
                bg="linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(32, 178, 170, 0.1) 100%)"
                border="2px solid"
                borderColor="rgba(255, 107, 53, 0.2)"
                position="relative"
                _before={{
                  content: '"🚀"',
                  position: "absolute",
                  top: "-12px",
                  left: "24px",
                  bg: "white",
                  px: 3,
                  py: 1,
                  borderRadius: "full",
                  fontSize: "lg",
                  fontWeight: "bold"
                }}
              >
                <HStack spacing={4} justify="flex-end" pt={2}>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      clearAddForm();
                      onAddProjectClose();
                    }}
                    borderColor="gray.300"
                    color="gray.600"
                    _hover={{ 
                      bg: "gray.50",
                      borderColor: "gray.400",
                      transform: "translateY(-1px)"
                    }}
                    transition="all 0.3s ease"
                    borderRadius="xl"
                    px={8}
                    py={3}
                    fontWeight="600"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    bg="linear-gradient(135deg, #FF6B35 0%, #20B2AA 100%)"
                    color="white"
                    _hover={{
                      bg: "linear-gradient(135deg, #e55a2b 0%, #17a2b8 100%)",
                      transform: "translateY(-2px) scale(1.02)",
                      boxShadow: "0 12px 35px rgba(255, 107, 53, 0.4)",
                      _before: {
                        left: "100%"
                      }
                    }}
                    _active={{ 
                      transform: "translateY(0) scale(1)" 
                    }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    onClick={handleCreateProject}
                    isLoading={isCreatingProject}
                    loadingText="Creating..."
                    disabled={isCreatingProject}
                    borderRadius="xl"
                    px={8}
                    py={3}
                    fontWeight="700"
                    fontSize="md"
                    boxShadow="0 8px 25px rgba(255, 107, 53, 0.3)"
                    position="relative"
                    overflow="hidden"
                    _before={{
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                      transition: "left 0.5s"
                    }}
                  >
                    {isCreatingProject ? "Creating..." : "✨ Create Project"}
                  </Button>
                </HStack>
              </Box>

            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ProfessionalDashboard;
