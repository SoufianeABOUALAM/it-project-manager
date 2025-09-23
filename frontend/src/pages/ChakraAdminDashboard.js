import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Icon,
  Button,
  Badge,
  Flex,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Avatar,
  AvatarGroup,
  Center,
  Image,
  AspectRatio,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  Stack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { chakra } from '@chakra-ui/react';
import {
  MdDashboard,
  MdBusiness,
  MdCheckCircle,
  MdTrendingUp,
  MdEuro,
  MdAttachMoney,
  MdPeople,
  MdSecurity,
  MdCloudDone,
  MdAdd,
  MdSync,
  MdSearch,
  MdMoreVert,
  MdArrowForward,
  MdComputer,
  MdPrint,
  MdWifi,
  MdVideocam,
  MdRouter,
  MdAnalytics,
  MdAssessment,
  MdPieChart,
  MdShowChart,
  MdAccountBalance,
  MdSpeed,
  MdRefresh,
  MdInsights,
  MdDataUsage,
  MdTimeline,
  MdBarChart,
  MdLineChart,
  MdNotifications,
  MdSettings,
  MdStar,
  MdFlashOn,
  MdRocket,
  MdTrendingDown,
  MdWarning,
  MdInfo,
  MdLightbulb,
  MdAutoGraph,
  MdPlayArrow,
  MdPause,
  MdStop,
  MdExpandMore,
  MdFilterList,
  MdDownload,
  MdShare,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdFavorite,
  MdThumbUp,
  MdComment,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdCalendarToday,
  MdAccessTime,
  MdPerson,
  MdGroup,
  MdPublic,
  MdLock,
  MdVerified,
  MdGrade,
  MdTrendingFlat,
  MdCompareArrows,
  MdDonutLarge,
  MdStackedLineChart,
  MdScatterPlot,
  MdBubbleChart,
  MdCandlestickChart
} from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import ProjectForm from './ProjectForm';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

// Advanced Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.5); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Animated Components
const FloatBox = chakra(Box, {
  baseStyle: {
    animation: `${float} 6s ease-in-out infinite`,
  },
});

const PulseBox = chakra(Box, {
  baseStyle: {
    animation: `${pulse} 2s ease-in-out infinite`,
  },
});

const RotateBox = chakra(Box, {
  baseStyle: {
    animation: `${rotate} 20s linear infinite`,
  },
});

const GlowBox = chakra(Box, {
  baseStyle: {
    animation: `${glow} 3s ease-in-out infinite`,
  },
});

const SlideInBox = chakra(Box, {
  baseStyle: {
    animation: `${slideIn} 0.8s ease-out`,
  },
});

const BounceBox = chakra(Box, {
  baseStyle: {
    animation: `${bounce} 2s ease-in-out infinite`,
  },
});

const ShimmerBox = chakra(Box, {
  baseStyle: {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200px 100%',
    animation: `${shimmer} 2s infinite`,
  },
});

const GradientBox = chakra(Box, {
  baseStyle: {
    background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
    backgroundSize: '400% 400%',
    animation: `${gradient} 15s ease infinite`,
  },
});

const ChakraAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalUsers: 0,
    totalMaterials: 0,
    totalInvestmentEUR: 0,
    totalInvestmentMAD: 0
  });
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('All');
  const [animatedCounts, setAnimatedCounts] = useState({
    projects: 0,
    users: 0,
    investment: 0
  });
  const [chartData, setChartData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [projectTrends, setProjectTrends] = useState([]);
  const [equipmentStats, setEquipmentStats] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { user, authToken } = useAuth();
  const toast = useToast();

  // Color mode values with enhanced gradients
  const bg = useColorModeValue('linear(to-br, gray.50, blue.50, purple.50)', 'linear(to-br, gray.900, blue.900, purple.900)');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Enhanced gradient definitions
  const primaryGradient = 'linear(to-r, blue.400, purple.500, pink.500)';
  const successGradient = 'linear(to-r, green.400, teal.500, cyan.500)';
  const warningGradient = 'linear(to-r, orange.400, red.500, pink.500)';
  const infoGradient = 'linear(to-r, cyan.400, blue.500, purple.500)';

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const headers = {
        'Authorization': `Token ${authToken}`,
        'Content-Type': 'application/json',
      };

      // Fetch projects
      console.log('Fetching projects with headers:', headers);
      console.log('Current user:', user);
      const projectsResponse = await axios.get(`${API_URL}projects/`, { headers });
      console.log('Full projects response:', projectsResponse.data);
      const projectsData = Array.isArray(projectsResponse.data) ? projectsResponse.data : 
                          Array.isArray(projectsResponse.data.results) ? projectsResponse.data.results : [];
      console.log('Projects from API:', projectsData);
      console.log('Projects response status:', projectsResponse.status);
      setProjects(projectsData);

      // Fetch users
      const usersResponse = await axios.get(`${API_URL}auth/users/`, { headers });
      const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      setUsers(usersData);

      // Fetch materials
      const materialsResponse = await axios.get(`${API_URL}materials/`, { headers });
      const materialsData = Array.isArray(materialsResponse.data) ? materialsResponse.data : [];
      setMaterials(materialsData);

      // Calculate stats
      const totalProjects = projectsData.length;
      const activeProjects = projectsData.filter(p => p.status === 'active').length;
      const totalUsers = usersData.length;
      const totalMaterials = materialsData.length;
      
      // Calculate total investment
      const totalInvestmentEUR = projectsData.reduce((sum, project) => {
        return sum + (parseFloat(project.total_cost_france) || 0);
      }, 0);
      
      const totalInvestmentMAD = projectsData.reduce((sum, project) => {
        return sum + (parseFloat(project.total_cost_morocco) || 0);
      }, 0);

      setStats({
        totalProjects,
        activeProjects,
        totalUsers,
        totalMaterials,
        totalInvestmentEUR,
        totalInvestmentMAD
      });

      // Calculate real analytics data
      calculateRealAnalytics(projectsData, usersData, materialsData);

      // Animate counters
      animateCounters(totalProjects, totalUsers, totalInvestmentEUR);

      // Update last updated time
      setLastUpdated(new Date());


    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateRealAnalytics = (projects, users, materials) => {
    // Calculate monthly project trends
    const monthlyData = {};
    projects.forEach(project => {
      if (project.created_at) {
        const month = new Date(project.created_at).toLocaleDateString('en-US', { month: 'short' });
        if (!monthlyData[month]) {
          monthlyData[month] = { projects: 0, revenue: 0 };
        }
        monthlyData[month].projects += 1;
        monthlyData[month].revenue += parseFloat(project.total_cost_france) || 0;
      }
    });

    // Convert to chart data
    const chartDataArray = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      projects: data.projects,
      revenue: data.revenue
    }));

    setChartData(chartDataArray);

    // Calculate revenue distribution by project type
    const revenueDistribution = {};
    projects.forEach(project => {
      const type = project.name.includes('Network') ? 'Infrastructure' :
                   project.name.includes('Migration') ? 'Migration' :
                   project.name.includes('Security') ? 'Security' : 'Other';
      
      if (!revenueDistribution[type]) {
        revenueDistribution[type] = 0;
      }
      revenueDistribution[type] += parseFloat(project.total_cost_france) || 0;
    });

    const totalRevenue = Object.values(revenueDistribution).reduce((sum, val) => sum + val, 0);
    const revenueDataArray = Object.entries(revenueDistribution).map(([type, amount]) => ({
      name: type,
      value: totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0,
      amount: amount,
      color: type === 'Infrastructure' ? 'blue.500' :
             type === 'Security' ? 'purple.500' :
             type === 'Migration' ? 'green.500' : 'orange.500'
    }));

    setRevenueData(revenueDataArray);

    // Calculate project trends
    const trends = projects.map(project => ({
      id: project.id,
      name: project.name,
      status: project.status,
      users: project.number_of_users || 0,
      investment: parseFloat(project.total_cost_france) || 0,
      created: project.created_at
    }));

    console.log('Project trends calculated:', trends);
    setProjectTrends(trends);

    // Calculate equipment statistics
    const equipmentStats = {
      totalLaptops: projects.reduce((sum, p) => sum + (p.num_laptop_office || 0) + (p.num_laptop_tech || 0), 0),
      totalDesktops: projects.reduce((sum, p) => sum + (p.num_desktop_office || 0) + (p.num_desktop_tech || 0), 0),
      totalPrinters: projects.reduce((sum, p) => sum + (p.num_printers || 0), 0),
      totalAccessPoints: projects.reduce((sum, p) => sum + (p.num_aps || 0), 0),
      totalVideoConference: projects.reduce((sum, p) => sum + (p.num_videoconference || 0), 0),
      totalNetworkEquipment: projects.reduce((sum, p) => sum + (p.num_traceau || 0), 0)
    };

    setEquipmentStats(equipmentStats);
  };

  const animateCounters = (projects, users, investment) => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedCounts({
        projects: Math.floor(projects * easeOut),
        users: Math.floor(users * easeOut),
        investment: Math.floor(investment * easeOut)
      });

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedCounts({
          projects,
          users,
          investment
        });
      }
    }, stepDuration);
  };

  useEffect(() => {
    if (authToken) {
      fetchAdminData();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchAdminData();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [authToken]);

  if (loading) {
    return (
      <Box bg={bg} minH="100vh" pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Container maxW="container.xl" py={8}>
          <Center>
            <VStack spacing={6}>
              <GlowBox>
                <Spinner size="xl" color="blue.500" thickness="4px" />
              </GlowBox>
              <VStack spacing={2}>
                <Text fontSize="xl" fontWeight="bold" color={textColor}>
                  Loading Dashboard...
                </Text>
                <Text color={mutedTextColor}>
                  Preparing your data visualization
                </Text>
              </VStack>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg={bg} minH="100vh" pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Container maxW="container.xl" py={8}>
          <Alert status="error" borderRadius="xl" bg="red.50" border="1px solid" borderColor="red.200">
            <AlertIcon />
            <Box>
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bg} minH="100vh" pt={{ base: '130px', md: '80px', xl: '80px' }} position="relative" overflow="hidden">
      {/* Animated Background Elements */}
      <Box position="absolute" top="0" left="0" w="100%" h="100%" overflow="hidden" zIndex={0}>
        <FloatBox position="absolute" top="10%" left="10%" opacity="0.1">
          <Icon as={MdRocket} w={32} h={32} color="blue.400" />
        </FloatBox>
        <RotateBox position="absolute" top="20%" right="15%" opacity="0.1">
          <Icon as={MdFlashOn} w={24} h={24} color="purple.400" />
        </RotateBox>
        <FloatBox position="absolute" bottom="20%" left="20%" opacity="0.1">
          <Icon as={MdStar} w={28} h={28} color="pink.400" />
        </FloatBox>
        <RotateBox position="absolute" bottom="10%" right="20%" opacity="0.1">
          <Icon as={MdLightbulb} w={20} h={20} color="yellow.400" />
        </RotateBox>
      </Box>

      <Container maxW="container.xl" py={8} position="relative" zIndex={1}>
        {/* Enhanced Header Section */}
        <SlideInBox>
          <Flex justify="flex-end" align="center" mb={8}>
            <HStack spacing={4}>
              <InputGroup maxW="800px">
                <InputLeftElement pointerEvents="none">
                  <Icon as={MdSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg={cardBg}
                  borderColor={borderColor}
                  borderRadius="xl"
                  w="800px"
                  h="50px"
                  fontSize="lg"
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                />
              </InputGroup>
              <Button
                leftIcon={<Icon as={MdRefresh} />}
                bgGradient={primaryGradient}
                color="white"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                borderRadius="xl"
                onClick={fetchAdminData}
              >
                Refresh
              </Button>
              <Button
                leftIcon={<Icon as={MdAdd} />}
                bgGradient={successGradient}
                color="white"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                borderRadius="xl"
                onClick={() => setShowProjectForm(true)}
              >
                New Project
              </Button>
            </HStack>
          </Flex>
        </SlideInBox>

        {/* Enhanced Project Performance Table */}
        <Card bg={cardBg} borderRadius="2xl" boxShadow="xl" overflow="hidden" mb={8}>
          <CardHeader bgGradient={warningGradient} color="white">
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Icon as={MdAssessment} w={6} h={6} />
                <Heading size="md">Project Performance Matrix</Heading>
                    </HStack>
                    <HStack spacing={2}>
                    <IconButton
                  aria-label="Search"
                  icon={<Icon as={MdSearch} />}
                      variant="ghost"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                />
                <Menu>
                  <MenuButton as={Button} variant="ghost" color="white" rightIcon={<Icon as={MdExpandMore} />}>
                    Projects: {selectedChannel}
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => setSelectedChannel('All')}>All Projects</MenuItem>
                    <MenuItem onClick={() => setSelectedChannel('Active')}>Active Only</MenuItem>
                    <MenuItem onClick={() => setSelectedChannel('Completed')}>Completed</MenuItem>
                    <MenuItem onClick={() => setSelectedChannel('Pending')}>Pending</MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
                </Flex>
          </CardHeader>
          <CardBody p={0}>
            <TableContainer>
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th color={mutedTextColor} fontSize="sm" fontWeight="700" textTransform="uppercase" letterSpacing="wider">NO.</Th>
                    <Th color={mutedTextColor} fontSize="sm" fontWeight="700" textTransform="uppercase" letterSpacing="wider">PROJECT</Th>
                    <Th color={mutedTextColor} fontSize="sm" fontWeight="700" textTransform="uppercase" letterSpacing="wider">USERS</Th>
                    <Th color={mutedTextColor} fontSize="sm" fontWeight="700" textTransform="uppercase" letterSpacing="wider">EQUIPMENT</Th>
                    <Th color={mutedTextColor} fontSize="sm" fontWeight="700" textTransform="uppercase" letterSpacing="wider">MATERIALS</Th>
                    <Th color={mutedTextColor} fontSize="sm" fontWeight="700" textTransform="uppercase" letterSpacing="wider">COMPLEXITY</Th>
                    <Th color={mutedTextColor} fontSize="sm" fontWeight="700" textTransform="uppercase" letterSpacing="wider">VALUE</Th>
                    <Th color={mutedTextColor} fontSize="sm" fontWeight="700" textTransform="uppercase" letterSpacing="wider">ACTIONS</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(projectTrends.length > 0 || projects.length > 0) ? (projectTrends.length > 0 ? projectTrends : projects).map((project, index) => {
                    const equipment = (project.num_laptop_office || 0) + (project.num_laptop_tech || 0) + 
                                    (project.num_desktop_office || 0) + (project.num_desktop_tech || 0) + 
                                    (project.num_printers || 0) + (project.num_aps || 0);
                    const materials = (project.num_traceau || 0) + (project.num_videoconference || 0);
                    const complexity = project.users > 0 ? Math.round((equipment / project.users) * 10) / 10 : 0;
                    
                    return (
                    <Tr key={project.id} _hover={{ bg: "gray.50" }} transition="all 0.2s">
                      <Td color={textColor} fontWeight="600">{index + 1}</Td>
                      <Td>
                        <HStack spacing={3}>
                          <Box
                            w={10}
                            h={10}
                            bgGradient={index === 0 ? primaryGradient : index === 1 ? successGradient : index === 2 ? warningGradient : infoGradient}
                            borderRadius="xl"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            boxShadow="md"
                          >
                            <Text color="white" fontSize="sm" fontWeight="bold">
                              {project.name.charAt(0)}
                    </Text>
                          </Box>
                          <VStack align="start" spacing={1}>
                            <Text color={textColor} fontWeight="600" fontSize="sm">
                              {project.name}
                      </Text>
                            <HStack spacing={2}>
                              <Badge 
                                colorScheme={project.status === 'active' ? 'green' : project.status === 'completed' ? 'blue' : 'orange'}
                                borderRadius="full" 
                                px={2} 
                                py={1} 
                                fontSize="xs"
                              >
                                {project.name.includes('Network') ? 'INFRASTRUCTURE' :
                                 project.name.includes('Migration') ? 'MIGRATION' :
                                 project.name.includes('Security') ? 'SECURITY' : 'OTHER'}
                              </Badge>
                              <Badge 
                                colorScheme={project.status === 'active' ? 'green' : project.status === 'completed' ? 'blue' : 'orange'}
                                variant="outline"
                                borderRadius="full" 
                                px={2} 
                                py={1} 
                                fontSize="xs"
                              >
                                {project.status}
                      </Badge>
                    </HStack>
                  </VStack>
                        </HStack>
                      </Td>
                      <Td color={textColor} fontWeight="500">{project.users || project.number_of_users || 0}</Td>
                      <Td color={textColor} fontWeight="500">{equipment}</Td>
                      <Td color={textColor} fontWeight="500">{materials}</Td>
                      <Td color={textColor} fontWeight="500">{complexity}</Td>
                      <Td color="green.500" fontWeight="bold">
                        €{(project.investment || project.total_cost_france || 0).toLocaleString()}
                      </Td>
                    </Tr>
                    );
                  }) : (
                    <Tr>
                      <Td colSpan={8} textAlign="center" py={8}>
                        <VStack spacing={2}>
                          <Icon as={MdBusiness} w={12} h={12} color={mutedTextColor} />
                          <Text color={mutedTextColor} fontSize="lg" fontWeight="600">
                            No projects found
                    </Text>
                          <Text color={mutedTextColor} fontSize="sm">
                            Create your first project to see analytics
                        </Text>
                      </VStack>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
              </CardBody>
            </Card>

        {/* Enhanced Charts and Analytics Section */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8} mb={8}>
          {/* Projects & Revenue Chart */}
          <SlideInBox>
            <Card bg={cardBg} borderRadius="2xl" boxShadow="xl" overflow="hidden">
              <CardHeader bgGradient={primaryGradient} color="white">
                <HStack spacing={3}>
                  <Icon as={MdBarChart} w={6} h={6} />
                  <Heading size="md">Projects & Revenue Analytics</Heading>
                </HStack>
              </CardHeader>
              <CardBody p={6}>
                {/* Real Chart Data */}
                <Box h="300px" position="relative" overflow="hidden">
                  <GradientBox
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    opacity="0.1"
                    borderRadius="xl"
                  />
                  <VStack spacing={4} h="100%" justify="center" p={4}>
                    <GlowBox>
                      <Icon as={MdShowChart} w={20} h={20} color="blue.500" />
                    </GlowBox>
                    <VStack spacing={2}>
                      <Text color={textColor} fontSize="lg" fontWeight="bold" textAlign="center">
                        📊 Real-Time Analytics
                      </Text>
                      <Text color={mutedTextColor} fontSize="sm" textAlign="center">
                        Live project trends and revenue analysis
                      </Text>
                    </VStack>
                    
                    {/* Real Data Display */}
                    <SimpleGrid columns={3} gap={4} w="100%">
                      <VStack spacing={1} p={3} bg="whiteAlpha.500" borderRadius="lg">
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                          {chartData.length > 0 ? chartData.reduce((sum, item) => sum + item.projects, 0) : 0}
                        </Text>
                        <Text fontSize="xs" color={mutedTextColor}>Total Projects</Text>
                      </VStack>
                      <VStack spacing={1} p={3} bg="whiteAlpha.500" borderRadius="lg">
                        <Text fontSize="2xl" fontWeight="bold" color="green.500">
                          €{chartData.length > 0 ? chartData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString() : '0'}
                        </Text>
                        <Text fontSize="xs" color={mutedTextColor}>Total Revenue</Text>
                      </VStack>
                      <VStack spacing={1} p={3} bg="whiteAlpha.500" borderRadius="lg">
                        <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                          {stats.totalProjects > 0 ? Math.round((stats.activeProjects / stats.totalProjects) * 100) : 0}%
                        </Text>
                        <Text fontSize="xs" color={mutedTextColor}>Active Rate</Text>
                      </VStack>
                    </SimpleGrid>

                    {/* Monthly Trends */}
                    {chartData.length > 0 && (
                      <VStack spacing={2} w="100%">
                        <Text color={textColor} fontSize="sm" fontWeight="600">Monthly Trends</Text>
                        <HStack spacing={2} flexWrap="wrap" justify="center">
                          {chartData.slice(-6).map((item, index) => (
                            <VStack key={index} spacing={1} p={2} bg="whiteAlpha.300" borderRadius="md" minW="60px">
                              <Text fontSize="xs" color={mutedTextColor}>{item.month}</Text>
                              <Text fontSize="sm" fontWeight="bold" color="blue.500">{item.projects}</Text>
                              <Text fontSize="xs" color="green.500">€{item.revenue.toLocaleString()}</Text>
                            </VStack>
                          ))}
                        </HStack>
                      </VStack>
                    )}
                  </VStack>
                </Box>
              </CardBody>
            </Card>
          </SlideInBox>

          {/* Top Revenue Channels */}
          <SlideInBox>
            <Card bg={cardBg} borderRadius="2xl" boxShadow="xl" overflow="hidden">
              <CardHeader bgGradient={successGradient} color="white">
                <Flex justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Icon as={MdPieChart} w={6} h={6} />
                    <Heading size="md">Revenue Distribution</Heading>
                  </HStack>
                  <IconButton
                    aria-label="View Details"
                    icon={<Icon as={MdArrowForward} />}
                    variant="ghost"
                    color="white"
                    _hover={{ bg: "whiteAlpha.200" }}
                  />
                </Flex>
              </CardHeader>
              <CardBody p={6}>
                <VStack spacing={6}>
                  {/* Enhanced Donut Chart */}
                  <Box position="relative" w="250px" h="250px">
                    <CircularProgress
                      value={75}
                      size="250px"
                      color="blue.500"
                      thickness="12px"
                      trackColor="gray.100"
                    >
                      <CircularProgressLabel>
                        <VStack spacing={1}>
                          <Text fontSize="3xl" fontWeight="bold" color={textColor}>
                            €{stats.totalInvestmentEUR.toLocaleString()}
                          </Text>
                          <Text fontSize="sm" color={mutedTextColor}>
                            Total Revenue
                          </Text>
                          <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                            +15.2%
                          </Badge>
                        </VStack>
                      </CircularProgressLabel>
                    </CircularProgress>
                  </Box>
                  
                  {/* Real Revenue Distribution */}
                  <VStack spacing={3} w="100%">
                    {revenueData.length > 0 ? revenueData.map((channel, index) => (
                      <HStack key={index} w="100%" justify="space-between" p={3} bg="gray.50" borderRadius="xl">
                        <HStack spacing={3}>
                          <Box p={2} bg={`${channel.color.replace('.500', '.100')}`} borderRadius="lg">
                            <Icon as={
                              channel.name === 'Infrastructure' ? MdComputer :
                              channel.name === 'Security' ? MdSecurity :
                              channel.name === 'Migration' ? MdSync : MdMoreVert
                            } color={channel.color} />
                          </Box>
                          <VStack align="start" spacing={0}>
                            <Text color={textColor} fontSize="sm" fontWeight="600">{channel.name}</Text>
                            <Text color={mutedTextColor} fontSize="xs">Revenue Channel</Text>
                          </VStack>
                        </HStack>
                        <VStack align="end" spacing={0}>
                          <Text color={textColor} fontSize="lg" fontWeight="bold">{channel.value}%</Text>
                          <Text color={mutedTextColor} fontSize="xs">€{channel.amount.toLocaleString()}</Text>
                        </VStack>
                      </HStack>
                    )) : (
                      <VStack spacing={2} p={4}>
                        <Text color={mutedTextColor} fontSize="sm" textAlign="center">
                          No revenue data available
                        </Text>
                        <Text color={mutedTextColor} fontSize="xs" textAlign="center">
                          Create projects to see revenue distribution
                        </Text>
                      </VStack>
                    )}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </SlideInBox>
        </SimpleGrid>


        {/* Enhanced Action Center */}
        <Card bg={cardBg} borderRadius="2xl" boxShadow="xl" mt={8} overflow="hidden">
          <CardHeader bgGradient={infoGradient} color="white">
            <HStack spacing={3}>
              <Icon as={MdInsights} w={6} h={6} />
              <Heading size="md">Quick Actions & Analytics</Heading>
            </HStack>
          </CardHeader>
          <CardBody p={6}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} gap={4}>
              {[
                { name: 'Project Analytics', icon: MdPieChart, color: 'blue', gradient: primaryGradient },
                { name: 'Equipment Trends', icon: MdShowChart, color: 'green', gradient: successGradient },
                { name: 'Cost Analysis', icon: MdAccountBalance, color: 'purple', gradient: warningGradient },
                { name: 'Project Complexity', icon: MdAssessment, color: 'orange', gradient: infoGradient },
                { name: 'Cost Efficiency', icon: MdSpeed, color: 'teal', gradient: 'linear(to-r, teal.400, cyan.500, blue.500)' }
              ].map((action, index) => (
                <BounceBox key={index}>
                  <Button
                    leftIcon={<Icon as={action.icon} />}
                    bgGradient={action.gradient}
                    color="white"
                    _hover={{ 
                      transform: "translateY(-5px) scale(1.05)", 
                      boxShadow: "xl",
                      filter: "brightness(1.1)"
                    }}
                    size="lg"
                    h="80px"
                    borderRadius="2xl"
                    fontWeight="bold"
                    fontSize="sm"
                    transition="all 0.3s ease"
                    boxShadow="md"
                  >
                    {action.name}
                  </Button>
                </BounceBox>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      </Container>
      
      {/* Project Form Modal */}
      {showProjectForm && (
        <Box mt={8}>
          <ProjectForm
            onClose={() => setShowProjectForm(false)}
            onSuccess={() => {
              setShowProjectForm(false);
              fetchAdminData();
              toast({
                title: "Project Created!",
                description: "Your new project has been successfully created.",
                status: "success",
                duration: 3000,
                isClosable: true,
              });
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ChakraAdminDashboard;