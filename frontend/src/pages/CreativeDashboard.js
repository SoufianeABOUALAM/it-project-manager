import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Icon,
  Flex,
  Container,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Button,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Tooltip,
  IconButton,
  CircularProgress,
  CircularProgressLabel,
  ScaleFade,
  SlideFade,
  Fade,
  css,
  Badge,
  Progress,
  Divider,
  Avatar,
  Image,
  AspectRatio,
  Stack,
  Wrap,
  WrapItem,
  Link,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  Code,
  Kbd,
  Mark,
  Highlight,
  VisuallyHidden,
  VisuallyHiddenInput,
  SkipNavLink,
  SkipNavContent,
  Portal,
  PortalManager,
  EnvironmentProvider,
  ChakraProvider,
  ChakraBaseProvider,
  ChakraBaseProvider as BaseProvider,
  ChakraProvider as Provider,
  ColorModeProvider,
  ColorModeScript,
  ColorModeContext,
  CSSReset,
  GlobalStyle,
  theme,
  extendTheme,
  createStandaloneToast,
  createToastFn,
  createRenderToast,
  createMultiStyleConfigHelpers,
  createStylesContext,
  createDescendantContext,
  createExtendTheme,
  createIcon,
  createLocalStorageManager,
  createCookieStorageManager,
  createCookieStorageManagerSSR,
  createDescendantContext as createDescendantContextFn,
  createExtendTheme as createExtendThemeFn,
  createIcon as createIconFn,
  createLocalStorageManager as createLocalStorageManagerFn,
  createCookieStorageManager as createCookieStorageManagerFn,
  createCookieStorageManagerSSR as createCookieStorageManagerSSRFn,
  createMultiStyleConfigHelpers as createMultiStyleConfigHelpersFn,
  createStylesContext as createStylesContextFn,
  createToastFn as createToastFnFn,
  createRenderToast as createRenderToastFn,
  createStandaloneToast as createStandaloneToastFn,
  extendTheme as extendThemeFn,
  theme as themeFn,
  GlobalStyle as GlobalStyleFn,
  CSSReset as CSSResetFn,
  ColorModeScript as ColorModeScriptFn,
  ColorModeProvider as ColorModeProviderFn,
  ColorModeContext as ColorModeContextFn,
  ChakraProvider as ChakraProviderFn,
  ChakraBaseProvider as ChakraBaseProviderFn,
  EnvironmentProvider as EnvironmentProviderFn,
  PortalManager as PortalManagerFn,
  Portal as PortalFn,
  SkipNavContent as SkipNavContentFn,
  SkipNavLink as SkipNavLinkFn,
  VisuallyHiddenInput as VisuallyHiddenInputFn,
  VisuallyHidden as VisuallyHiddenFn,
  Highlight as HighlightFn,
  Mark as MarkFn,
  Kbd as KbdFn,
  Code as CodeFn,
  UnorderedList as UnorderedListFn,
  OrderedList as OrderedListFn,
  ListIcon as ListIconFn,
  ListItem as ListItemFn,
  List as ListFn,
  AccordionIcon as AccordionIconFn,
  AccordionPanel as AccordionPanelFn,
  AccordionButton as AccordionButtonFn,
  AccordionItem as AccordionItemFn,
  Accordion as AccordionFn,
  TableContainer as TableContainerFn,
  Td as TdFn,
  Th as ThFn,
  Tr as TrFn,
  Thead as TheadFn,
  Tbody as TbodyFn,
  Table as TableFn,
  TabPanel as TabPanelFn,
  TabPanels as TabPanelsFn,
  TabList as TabListFn,
  Tab as TabFn,
  Tabs as TabsFn,
  BreadcrumbSeparator as BreadcrumbSeparatorFn,
  BreadcrumbLink as BreadcrumbLinkFn,
  BreadcrumbItem as BreadcrumbItemFn,
  Breadcrumb as BreadcrumbFn,
  Link as LinkFn,
  WrapItem as WrapItemFn,
  Wrap as WrapFn,
  Stack as StackFn,
  AspectRatio as AspectRatioFn,
  Image as ImageFn,
  Avatar as AvatarFn,
  Divider as DividerFn,
  Progress as ProgressFn,
  Badge as BadgeFn,
  css as cssFn,
  Fade as FadeFn,
  SlideFade as SlideFadeFn,
  ScaleFade as ScaleFadeFn,
  CircularProgressLabel as CircularProgressLabelFn,
  CircularProgress as CircularProgressFn,
  IconButton as IconButtonFn,
  Tooltip as TooltipFn,
  useColorModeValue as useColorModeValueFn,
  StatArrow as StatArrowFn,
  StatHelpText as StatHelpTextFn,
  StatNumber as StatNumberFn,
  StatLabel as StatLabelFn,
  Stat as StatFn,
  useToast as useToastFn,
  Button as ButtonFn,
  Center as CenterFn,
  Spinner as SpinnerFn,
  AlertIcon as AlertIconFn,
  Alert as AlertFn,
  Heading as HeadingFn,
  CardHeader as CardHeaderFn,
  CardBody as CardBodyFn,
  Card as CardFn,
  Container as ContainerFn,
  Flex as FlexFn,
  HStack as HStackFn,
  VStack as VStackFn,
  Icon as IconFn,
  Text as TextFn,
  SimpleGrid as SimpleGridFn,
  Box as BoxFn
} from '@chakra-ui/react';
import {
  MdPeople,
  MdBusiness,
  MdInventory,
  MdCategory,
  MdAdd,
  MdDashboard,
  MdTrendingUp,
  MdCheckCircle,
  MdSchedule,
  MdAttachMoney,
  MdRefresh,
  MdStar,
  MdFavorite,
  MdThumbUp,
  MdSpeed,
  MdAnalytics,
  MdShowChart,
  MdTimeline,
  MdNetworkCheck,
  MdSecurity,
  MdCloud,
  MdStorage,
  MdMemory,
  MdCpu,
  MdWifi,
  MdBluetooth,
  MdUsb,
  MdCable,
  MdRouter,
  MdSwitch,
  MdAccessPoint,
  MdFirewall,
  MdServer,
  MdDatabase,
  MdBackup,
  MdSync,
  MdUpdate,
  MdDownload,
  MdUpload,
  MdShare,
  MdLink,
  MdCopy,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdSettings,
  MdNotifications,
  MdMenu,
  MdClose,
  MdArrowForward,
  MdArrowBack,
  MdArrowUpward,
  MdArrowDownward,
  MdExpandMore,
  MdExpandLess,
  MdChevronRight,
  MdChevronLeft,
  MdChevronUp,
  MdChevronDown,
  MdPlayArrow,
  MdPause,
  MdStop,
  MdReplay,
  MdSkipNext,
  MdSkipPrevious,
  MdVolumeUp,
  MdVolumeOff,
  MdVolumeDown,
  MdEqualizer,
  MdGraphicEq,
  MdMusicNote,
  MdHeadset,
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
  MdCall,
  MdCallEnd,
  MdMessage,
  MdChat,
  MdForum,
  MdComment,
  MdReply,
  MdForward,
  MdSend,
  MdAttachment,
  MdOpenInNew,
  MdOpenInBrowser,
  MdLaunch,
  MdExitToApp,
  MdPerson,
  MdPersonAdd,
  MdGroup,
  MdGroupAdd,
  MdSupervisorAccount,
  MdAdminPanelSettings,
  MdVerifiedUser,
  MdShield,
  MdLock,
  MdLockOpen,
  MdVisibilityOff,
  MdPublic,
  MdPrivate,
  MdWork,
  MdBusinessCenter,
  MdStore,
  MdShoppingCart,
  MdShoppingBasket,
  MdLocalGroceryStore,
  MdLocalMall,
  MdLocalOffer,
  MdLocalShipping,
  MdLocalTaxi,
  MdLocalHotel,
  MdLocalHospital,
  MdLocalPharmacy,
  MdLocalLibrary,
  MdLocalMovies,
  MdLocalPlay,
  MdLocalCafe,
  MdLocalDining,
  MdLocalDrink,
  MdLocalPizza,
  MdLocalSee,
  MdLocalFlorist,
  MdLocalGasStation,
  MdLocalCarWash,
  MdLocalParking,
  MdLocalAtm,
  MdLocalPostOffice,
  MdLocalPrintshop,
  MdLocalConvenienceStore,
  MdLocalLaundryService,
  MdLocalActivity,
  MdLocalAirport,
  MdLocalBar,
  MdLocalBeachAccess,
  MdLocalBus,
  MdLocalCarRental,
  MdLocalFireDepartment,
  MdLocalPolice,
  MdDirections,
  MdDirectionsBike,
  MdDirectionsBus,
  MdDirectionsCar,
  MdDirectionsRailway,
  MdDirectionsRun,
  MdDirectionsSubway,
  MdDirectionsTransit,
  MdDirectionsWalk,
  MdFlight,
  MdFlightLand,
  MdFlightTakeoff,
  MdTrain,
  MdTram,
  MdSubway,
  MdDirectionsBoat,
  MdDirectionsFerry,
  MdDirectionsShip,
  MdDirectionsPlane,
  MdDirectionsHelicopter,
  MdDirectionsRocket,
  MdDirectionsSatellite,
  MdDirectionsSpace,
  MdDirectionsUfo,
  MdDirectionsAlien,
  MdDirectionsRobot,
  MdDirectionsAndroid,
  MdDirectionsApple,
  MdDirectionsGoogle,
  MdDirectionsMicrosoft,
  MdDirectionsFacebook,
  MdDirectionsTwitter,
  MdDirectionsInstagram,
  MdDirectionsLinkedin,
  MdDirectionsYoutube,
  MdDirectionsTiktok,
  MdDirectionsSnapchat,
  MdDirectionsWhatsapp,
  MdDirectionsTelegram,
  MdDirectionsDiscord,
  MdDirectionsSlack,
  MdDirectionsZoom,
  MdDirectionsSkype,
  MdDirectionsTeams,
  MdDirectionsMeet,
  MdDirectionsHangout,
  MdDirectionsDuo,
  MdDirectionsAllo,
  MdDirectionsAssistant,
  MdDirectionsVoice,
  MdDirectionsVideo,
  MdDirectionsAudio,
  MdDirectionsImage,
  MdDirectionsFile,
  MdDirectionsFolder,
  MdDirectionsCloud,
  MdDirectionsStorage,
  MdDirectionsDatabase,
  MdDirectionsServer,
  MdDirectionsNetwork,
  MdDirectionsWifi,
  MdDirectionsBluetooth,
  MdDirectionsNfc,
  MdDirectionsGps,
  MdDirectionsLocation,
  MdDirectionsMap,
  MdDirectionsSatelliteAlt,
  MdDirectionsTerrain,
  MdDirectionsStreetview,
  MdDirectionsTraffic,
  MdDirectionsConstruction,
  MdDirectionsRoad,
  MdDirectionsHighway,
  MdDirectionsBridge,
  MdDirectionsTunnel,
  MdDirectionsRailwayAlt,
  MdDirectionsSubwayAlt,
  MdDirectionsBusAlt,
  MdDirectionsCarAlt,
  MdDirectionsBikeAlt,
  MdDirectionsWalkAlt,
  MdDirectionsRunAlt,
  MdDirectionsTransitAlt,
  MdDirectionsRailwayAlt as MdRailwayAlt,
  MdDirectionsSubwayAlt as MdSubwayAlt,
  MdDirectionsBusAlt as MdBusAlt,
  MdDirectionsCarAlt as MdCarAlt,
  MdDirectionsBikeAlt as MdBikeAlt,
  MdDirectionsWalkAlt as MdWalkAlt,
  MdDirectionsRunAlt as MdRunAlt,
  MdDirectionsTransitAlt as MdTransitAlt
} from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/';

// Creative animation styles
const creativeFloat = css`
  @keyframes creativeFloat {
    0%, 100% { 
      transform: translateY(0px) rotate(0deg);
      filter: hue-rotate(0deg);
    }
    25% { 
      transform: translateY(-15px) rotate(2deg);
      filter: hue-rotate(90deg);
    }
    50% { 
      transform: translateY(-8px) rotate(0deg);
      filter: hue-rotate(180deg);
    }
    75% { 
      transform: translateY(-20px) rotate(-2deg);
      filter: hue-rotate(270deg);
    }
  }
  animation: creativeFloat 6s ease-in-out infinite;
`;

const creativeGlow = css`
  @keyframes creativeGlow {
    0%, 100% { 
      box-shadow: 0 0 20px rgba(255, 107, 53, 0.4), 0 0 40px rgba(255, 107, 53, 0.2);
      text-shadow: 0 0 10px rgba(255, 107, 53, 0.6);
    }
    50% { 
      box-shadow: 0 0 30px rgba(255, 107, 53, 0.6), 0 0 60px rgba(255, 107, 53, 0.4);
      text-shadow: 0 0 20px rgba(255, 107, 53, 0.8);
    }
  }
  animation: creativeGlow 3s ease-in-out infinite alternate;
`;

const creativePulse = css`
  @keyframes creativePulse {
    0%, 100% { 
      transform: scale(1);
      filter: brightness(1);
    }
    50% { 
      transform: scale(1.05);
      filter: brightness(1.2);
    }
  }
  animation: creativePulse 2s ease-in-out infinite;
`;

const creativeRotate = css`
  @keyframes creativeRotate {
    0% { 
      transform: rotate(0deg);
    }
    100% { 
      transform: rotate(360deg);
    }
  }
  animation: creativeRotate 20s linear infinite;
`;

const creativeWave = css`
  @keyframes creativeWave {
    0%, 100% { 
      transform: translateX(0px);
      filter: hue-rotate(0deg);
    }
    25% { 
      transform: translateX(10px);
      filter: hue-rotate(90deg);
    }
    50% { 
      transform: translateX(0px);
      filter: hue-rotate(180deg);
    }
    75% { 
      transform: translateX(-10px);
      filter: hue-rotate(270deg);
    }
  }
  animation: creativeWave 4s ease-in-out infinite;
`;

const creativeBounce = css`
  @keyframes creativeBounce {
    0%, 100% { 
      transform: translateY(0px);
    }
    50% { 
      transform: translateY(-10px);
    }
  }
  animation: creativeBounce 2s ease-in-out infinite;
`;

const CreativeDashboard = () => {
  const { authToken, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [stats, setStats] = useState({
    total_users: 0,
    total_projects: 0,
    total_materials: 0,
    total_categories: 0,
    active_projects: 0,
    completed_projects: 0,
    draft_projects: 0,
    total_cost_france: 0,
    total_cost_morocco: 0
  });
  
  const [recentProjects, setRecentProjects] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time only once on mount
  useEffect(() => {
    setCurrentTime(new Date());
  }, []);

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('orange.500', 'orange.400');

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      
      // Check if user is admin
      const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.is_staff;
      
      if (isAdmin) {
        // Admin gets full dashboard stats
        const response = await axios.get(`${API_URL}dashboard/stats/`, {
          headers: { Authorization: `Token ${authToken}` }
        });
        
        // Extract summary data from the response
        const data = response.data.summary || response.data;
        const financialData = response.data.financial || {};
        
        // Dashboard data loaded successfully
        
        setStats({
          total_users: data.total_users || 0,
          total_projects: data.total_projects || 0,
          total_materials: data.total_materials || 0,
          total_categories: data.total_categories || 0,
          active_projects: data.active_projects || 0,
          completed_projects: data.completed_projects || 0,
          draft_projects: data.draft_projects || 0,
          total_cost_france: financialData.total_cost_france || 0,
          total_cost_morocco: financialData.total_cost_morocco || 0
        });
        
        // For admin, fetch recent projects separately
        try {
          const projectsRes = await axios.get(`${API_URL}projects/projects/`, {
            headers: { Authorization: `Token ${authToken}` }
          });
          const allProjects = projectsRes.data.results || projectsRes.data || [];
          // Simple approach: just take the first 3 projects
          const recentProjects = allProjects.slice(0, 3);
          setRecentProjects(recentProjects);
        } catch (err) {
          // Failed to fetch recent projects
          setRecentProjects([]);
        }
      } else {
        // Regular users get their own project stats
        const projectsRes = await axios.get(`${API_URL}projects/projects/`, {
          headers: { Authorization: `Token ${authToken}` }
        });
        
        // Try to fetch materials, but don't fail if not accessible
        let materialsRes = null;
        try {
          materialsRes = await axios.get(`${API_URL}materials/`, {
            headers: { Authorization: `Token ${authToken}` }
          });
        } catch (err) {
          // Materials endpoint not accessible for regular user, using empty array
          materialsRes = { data: [] };
        }
        
        const userProjects = projectsRes.data.results || projectsRes.data || [];
        const materials = materialsRes.data.results || materialsRes.data || [];
        
        // Calculate user-specific stats
        const today = new Date();
        const activeProjects = (userProjects || []).filter(p => 
          p.status === 'active' || (p.start_date && new Date(p.start_date) <= today && 
          (!p.end_date || new Date(p.end_date) >= today))
        ).length;
        
        const completedProjects = (userProjects || []).filter(p => 
          p.status === 'completed'
        ).length;
        
        const draftProjects = (userProjects || []).filter(p => 
          p.status === 'draft' || !p.status
        ).length;
        
        setStats({
          total_users: 1, // Just the current user
          total_projects: userProjects.length,
          total_materials: materials.length,
          total_categories: [...new Set(materials.map(m => m.category?.name))].length,
          active_projects: activeProjects,
          completed_projects: completedProjects,
          draft_projects: draftProjects,
          total_cost_france: (userProjects || []).reduce((sum, p) => sum + (parseFloat(p.total_cost_france) || 0), 0),
          total_cost_morocco: (userProjects || []).reduce((sum, p) => sum + (parseFloat(p.total_cost_morocco) || 0), 0)
        });
        
        // Project data processed successfully
        
        // Set recent projects (latest 3 projects)
        // Simple approach: just take the first 3 projects
        const recentProjects = (userProjects || []).slice(0, 3);
        setRecentProjects(recentProjects);
      }
      
      setError(null);
    } catch (err) {
      // Failed to fetch dashboard data
      setError('Failed to fetch dashboard data');
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchStats();
    }
  }, [authToken]);

  const handleCreateProject = () => {
    // Navigate to projects page with form open
    if (user?.role === 'admin' || user?.role === 'super_admin' || user?.is_staff) {
      navigate('/admin/projects?open=add');
    } else {
      navigate('/projects?open=add');
    }
  };

  const handleRefresh = () => {
    fetchStats();
  };

  const handleRecalculateAllBudgets = async () => {
    try {
      // First, check materials status
      const statusResponse = await axios.get(`${API_URL}materials/check-materials-status/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      console.log('Materials status:', statusResponse.data);
      
      // Setup default materials if needed
      if (statusResponse.data.status === 'empty') {
        console.log('Setting up default materials...');
        await axios.post(`${API_URL}materials/setup-default-materials/`, {}, {
          headers: { Authorization: `Token ${authToken}` }
        });
      }
      
      // Then recalculate all project budgets
      const response = await axios.post(`${API_URL}projects/projects/recalculate-all/`, {}, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      console.log('Recalculate response:', response.data);
      
      toast({
        title: 'Success',
        description: response.data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Refresh the stats
      await fetchStats();
      
    } catch (error) {
      console.error('Failed to recalculate budgets:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to recalculate budgets';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 8000,
        isClosable: true,
      });
    }
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    if (amount === null || amount === undefined || isNaN(amount) || amount === '') {
      return '0 €';
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'EUR' ? 'EUR' : 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Center h="100vh" bg={bgColor}>
        <VStack spacing={8}>
          <Box css={creativeRotate}>
            <CircularProgress
              isIndeterminate
              color="orange.500"
              size="120px"
              thickness="8px"
              trackColor="gray.200"
              capIsRound
            />
          </Box>
          <VStack spacing={4}>
            <Text fontSize="2xl" fontWeight="bold" color="orange.500" css={creativeGlow}>
              🎨 Loading Creative Dashboard...
            </Text>
            <Text color="gray.500" fontSize="lg">
              Preparing your creative workspace
            </Text>
          </VStack>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.lg" py={8}>
        <ScaleFade in={true} initialScale={0.9}>
          <Alert status="error" borderRadius="xl" p={8}>
            <AlertIcon />
            <VStack align="start" spacing={4}>
              <Text fontSize="lg" fontWeight="bold">
                🚨 Error Loading Dashboard
              </Text>
              <Text>{error}</Text>
              <Button 
                onClick={handleRefresh} 
                leftIcon={<MdRefresh />}
                colorScheme="orange"
                variant="outline"
                _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.3s"
              >
                🔄 Retry
              </Button>
            </VStack>
          </Alert>
        </ScaleFade>
      </Container>
    );
  }

  const CreativeStatCard = ({ title, value, icon, color, helpText, trend, delay = 0 }) => (
    <ScaleFade in={true} initialScale={0.8} delay={delay}>
      <Card 
        bg={cardBg} 
        borderRadius="2xl" 
        boxShadow="xl"
        border="2px solid"
        borderColor={`${color}.200`}
        _hover={{ 
          transform: 'translateY(-12px) scale(1.05)',
          boxShadow: `0 0 30px ${color}.300`,
          borderColor: `${color}.400`,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        position="relative"
        overflow="hidden"
        onMouseEnter={() => setHoveredCard(title)}
        onMouseLeave={() => setHoveredCard(null)}
        css={hoveredCard === title ? creativeFloat : ''}
      >
        {/* Creative gradient overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient={`linear(135deg, ${color}.100, ${color}.200, ${color}.100)`}
          opacity={hoveredCard === title ? 0.4 : 0.1}
          transition="opacity 0.3s"
        />
        
        <CardBody p={8}>
          <Flex align="center" justify="space-between">
            <VStack align="start" spacing={4}>
              <Text 
                fontSize="sm" 
                color={`${color}.600`} 
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                {title}
              </Text>
              <Stat>
                <StatNumber 
                  fontSize="5xl" 
                  fontWeight="black" 
                  color={`${color}.700`}
                  css={hoveredCard === title ? creativeGlow : ''}
                >
                  {value}
                </StatNumber>
                {helpText && (
                  <StatHelpText fontSize="sm" color="gray.500" mt={2}>
                    {helpText}
                  </StatHelpText>
                )}
              </Stat>
            </VStack>
            <Box
              p={6}
              borderRadius="2xl"
              bgGradient={`linear(135deg, ${color}.400, ${color}.600)`}
              color="white"
              boxShadow="lg"
              css={hoveredCard === title ? creativePulse : ''}
            >
              <Icon as={icon} boxSize={10} />
            </Box>
          </Flex>
          {trend && (
            <Flex align="center" mt={4}>
              <StatArrow type={trend > 0 ? 'increase' : 'decrease'} />
              <Text fontSize="sm" color="gray.500" ml={2}>
                {Math.abs(trend)}% from last period
              </Text>
            </Flex>
          )}
        </CardBody>
      </Card>
    </ScaleFade>
  );

  const CreativeActionCard = ({ title, description, icon, color, onClick, delay = 0, isSmall = false }) => (
    <SlideFade in={true} offsetY="30px" delay={delay}>
      <Card 
        bg={cardBg} 
        borderRadius="2xl" 
        boxShadow="xl"
        cursor="pointer"
        border="2px solid"
        borderColor={`${color}.200`}
        _hover={{ 
          transform: 'translateY(-15px) scale(1.08)',
          boxShadow: `0 0 40px ${color}.300`,
          borderColor: `${color}.400`,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        position="relative"
        overflow="hidden"
        onClick={onClick}
      >
        {/* Creative overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient={`linear(135deg, ${color}.100, ${color}.200)`}
          opacity={0}
          transition="opacity 0.3s"
          _hover={{ opacity: 0.3 }}
        />
        
        <CardBody p={isSmall ? 2 : 8}>
          <VStack spacing={isSmall ? 1 : 6}>
            <Box
              p={isSmall ? 2 : 8}
              borderRadius="xl"
              bgGradient={`linear(135deg, ${color}.400, ${color}.600)`}
              color="white"
              boxShadow="lg"
              css={creativeFloat}
            >
              <Icon as={icon} boxSize={isSmall ? 4 : 14} />
            </Box>
            <VStack spacing={isSmall ? 0.5 : 4}>
              <Heading size={isSmall ? "xs" : "lg"} color={`${color}.700`} textAlign="center">
                {title}
              </Heading>
              <Text fontSize={isSmall ? "2xs" : "md"} color="gray.600" textAlign="center" lineHeight="tall">
                {description}
              </Text>
            </VStack>
            <Button
              colorScheme={color}
              size={isSmall ? "xs" : "lg"}
              borderRadius="lg"
              bgGradient={`linear(135deg, ${color}.400, ${color}.600)`}
              _hover={{ 
                transform: 'scale(1.1)',
                boxShadow: `0 0 25px ${color}.400`
              }}
              transition="all 0.3s"
              fontWeight="bold"
              css={creativeBounce}
            >
              🚀 Go
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </SlideFade>
  );

  const CreativeProgressRing = ({ value, max, color, size = "140px", thickness = "10px" }) => (
    <Box position="relative">
      <CircularProgress
        value={(value / max) * 100}
        color={`${color}.500`}
        size={size}
        thickness={thickness}
        trackColor="gray.200"
        capIsRound
        css={creativeFloat}
      >
        <CircularProgressLabel fontSize="3xl" fontWeight="bold" color={`${color}.700`} css={creativeGlow}>
          {value}
        </CircularProgressLabel>
      </CircularProgress>
    </Box>
  );

  return (
    <Box bg={bgColor} minH="100vh" position="relative">
      {/* Creative background elements */}
      <Box
        position="absolute"
        top="5%"
        left="5%"
        w="300px"
        h="300px"
        borderRadius="full"
        bgGradient="linear(135deg, orange.200, red.200, pink.200)"
        opacity={0.3}
        css={creativeFloat}
      />
      <Box
        position="absolute"
        top="20%"
        right="5%"
        w="250px"
        h="250px"
        borderRadius="full"
        bgGradient="linear(135deg, blue.200, purple.200, cyan.200)"
        opacity={0.3}
        css={creativeFloat}
      />
      <Box
        position="absolute"
        bottom="5%"
        left="20%"
        w="200px"
        h="200px"
        borderRadius="full"
        bgGradient="linear(135deg, green.200, teal.200, lime.200)"
        opacity={0.3}
        css={creativeFloat}
      />
      <Box
        position="absolute"
        top="60%"
        right="20%"
        w="180px"
        h="180px"
        borderRadius="full"
        bgGradient="linear(135deg, yellow.200, orange.200, red.200)"
        opacity={0.3}
        css={creativeFloat}
      />
      
      <Container maxW="container.xl" py={12}>
        {/* Creative Header */}
        <Fade in={true}>
          <Flex justify="space-between" align="center" mb={16}>
            <VStack align="start" spacing={6}>
            </VStack>
          </Flex>
        </Fade>

        {/* Main Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} mb={16}>
          <CreativeStatCard
            title={user?.role === 'admin' || user?.role === 'super_admin' || user?.is_staff ? "Total Projects" : "My Projects"}
            value={stats.total_projects}
            icon={MdBusiness}
            color="orange"
            helpText="Project count"
            delay={0.1}
          />
          <CreativeStatCard
            title={user?.role === 'admin' || user?.role === 'super_admin' || user?.is_staff ? "Total Users" : "My Account"}
            value={stats.total_users}
            icon={MdPeople}
            color="blue"
            helpText="User count"
            delay={0.2}
          />
          <CreativeStatCard
            title="In Draft Projects"
            value={stats.draft_projects}
            icon={MdEdit}
            color="orange"
            helpText="Draft count"
            delay={0.3}
          />
          <CreativeStatCard
            title="Completed Projects"
            value={stats.completed_projects}
            icon={MdCheckCircle}
            color="green"
            helpText="Completed count"
            delay={0.4}
          />
        </SimpleGrid>


        {/* Quick Actions and Financial Overview Side by Side */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={16}>
          {/* Quick Actions */}
          <SlideFade in={true} offsetY="30px" delay={0.6}>
            <Card bg={cardBg} borderRadius="3xl" boxShadow="xl" overflow="hidden" border="2px solid" borderColor="purple.200">
              <CardHeader bgGradient="linear(135deg, purple.100, pink.100)" p={8}>
                <Heading size="xl" color="purple.700" textAlign="center" css={creativeGlow}>
                  ⚡ Quick Actions
                </Heading>
              </CardHeader>
              <CardBody p={8}>
                <SimpleGrid columns={(user?.role === 'admin' || user?.role === 'super_admin' || user?.is_staff) ? 3 : 2} spacing={2}>
                  <CreativeActionCard
                    title="🚀 Create"
                    description="New project"
                    icon={MdAdd}
                    color="orange"
                    onClick={handleCreateProject}
                    delay={0.7}
                    isSmall={true}
                  />
                  <CreativeActionCard
                    title="📋 Projects"
                    description="View all"
                    icon={MdBusiness}
                    color="blue"
                    onClick={() => navigate((user?.role === 'admin' || user?.role === 'super_admin' || user?.is_staff) ? '/admin/projects' : '/projects')}
                    delay={0.8}
                    isSmall={true}
                  />
                  {(user?.role === 'admin' || user?.role === 'super_admin' || user?.is_staff) && (
                    <CreativeActionCard
                      title="🔧 Materials"
                      description="Manage"
                      icon={MdInventory}
                      color="green"
                      onClick={() => navigate('/admin/materials')}
                      delay={0.9}
                      isSmall={true}
                    />
                  )}
                </SimpleGrid>
              </CardBody>
            </Card>
          </SlideFade>

          {/* Financial Details */}
          <SlideFade in={true} offsetY="30px" delay={0.7}>
            <Card bg={cardBg} borderRadius="3xl" boxShadow="xl" overflow="hidden" border="2px solid" borderColor="green.200">
              <CardHeader bgGradient="linear(135deg, green.100, teal.100)" p={6}>
                <Heading size="lg" color="green.700" textAlign="center" css={creativeGlow}>
                  💰 Financial Details
                </Heading>
              </CardHeader>
              <CardBody p={4}>
                <VStack spacing={4}>
                  {/* Budget Summary */}
                  <HStack spacing={3} w="100%">
                    <Box
                      p={3}
                      borderRadius="lg"
                      bgGradient="linear(135deg, green.400, green.600)"
                      color="white"
                      boxShadow="md"
                      css={creativeFloat}
                      textAlign="center"
                      flex={1}
                    >
                      <Icon as={MdAttachMoney} boxSize={6} mb={1} />
                      <Text fontSize="md" fontWeight="bold" mb={1}>
                        {formatCurrency(stats.total_cost_france, 'EUR')}
                      </Text>
                      <Text fontSize="xs" opacity={0.9}>
                        🇫🇷 France Budget
                      </Text>
                    </Box>
                    <Box
                      p={3}
                      borderRadius="lg"
                      bgGradient="linear(135deg, blue.400, blue.600)"
                      color="white"
                      boxShadow="md"
                      css={creativeFloat}
                      textAlign="center"
                      flex={1}
                    >
                      <Icon as={MdAttachMoney} boxSize={6} mb={1} />
                      <Text fontSize="md" fontWeight="bold" mb={1}>
                        {formatCurrency(stats.total_cost_morocco, 'MAD')}
                      </Text>
                      <Text fontSize="xs" opacity={0.9}>
                        🇲🇦 Morocco Budget
                      </Text>
                    </Box>
                  </HStack>
                  
                </VStack>
              </CardBody>
            </Card>
          </SlideFade>
        </SimpleGrid>

        {/* Recent Projects */}
        <SlideFade in={true} offsetY="30px" delay={0.8}>
          <Card bg={cardBg} borderRadius="3xl" boxShadow="xl" overflow="hidden" border="2px solid" borderColor="orange.200" mb={16}>
            <CardHeader bgGradient="linear(135deg, orange.100, red.100, pink.100)" p={8}>
              <Heading size="xl" color="orange.700" textAlign="center" css={creativeGlow}>
                📋 Recent Projects
              </Heading>
            </CardHeader>
            <CardBody p={8}>
              {!recentProjects || recentProjects.length === 0 ? (
                <VStack spacing={4} py={8}>
                  {stats.total_projects > 0 ? (
                    <>
                      <Text fontSize="lg" color="orange.500" textAlign="center">
                        ⚠️ Projects exist but not displaying
                      </Text>
                      <Text fontSize="sm" color="gray.400" textAlign="center">
                        Total projects: {stats.total_projects}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text fontSize="lg" color="gray.500" textAlign="center">
                        No projects found
                      </Text>
                      <Text fontSize="sm" color="gray.400" textAlign="center">
                        Create your first project to get started!
                      </Text>
                    </>
                  )}
                </VStack>
              ) : (
                <VStack spacing={4}>
                  {recentProjects.map((project, index) => (
                    <Card 
                      key={project.id} 
                      bg="gray.50" 
                      borderRadius="xl" 
                      boxShadow="md"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ 
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg',
                        transition: 'all 0.3s'
                      }}
                      transition="all 0.3s"
                      w="100%"
                    >
                      <CardBody p={4}>
                        <Flex justify="space-between" align="center">
                          <VStack align="start" spacing={1}>
                            <Text fontSize="md" fontWeight="bold" color="gray.800">
                              {project.name || 'Unnamed Project'}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {project.entity || 'No Entity'} • {project.status || 'Draft'}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              Created: {new Date(project.created_at || project.id).toLocaleDateString()}
                            </Text>
                          </VStack>
                          <Box
                            p={2}
                            borderRadius="lg"
                            bgGradient={`linear(135deg, ${project.status === 'active' ? 'green' : project.status === 'completed' ? 'purple' : 'blue'}.400, ${project.status === 'active' ? 'green' : project.status === 'completed' ? 'purple' : 'blue'}.600)`}
                            color="white"
                          >
                            <Icon as={MdBusiness} boxSize={4} />
                          </Box>
                        </Flex>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>
        </SlideFade>
      </Container>
    </Box>
  );
};

export default CreativeDashboard;
