import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Icon,
  Flex,
  Button,
  Container,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Grid,
  GridItem,
  Input,
  Select,
  IconButton,
  Tooltip,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useColorModeValue,
  Image,
  Avatar,
  Wrap,
  WrapItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
} from '@chakra-ui/react';
import {
  MdInventory,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdSort,
  MdRefresh,
  MdAttachMoney,
  MdTrendingUp,
  MdTrendingDown,
  MdDateRange,
  MdCategory,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdStar,
  MdStarBorder,
  MdEuro,
  MdLocalAtm,
  MdAutoGraph,
  MdAnalytics,
  MdSpeed,
  MdSecurity,
  MdComputer,
  MdNetworkCheck,
  MdCloud,
  MdStorage,
  MdMemory,
  MdCable,
  MdRouter,
  MdLaptop,
  MdDesktopMac,
  MdPrint,
  MdWifi,
  MdVideocam,
  MdSettings,
  MdError,
} from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import AddCustomMaterialModal from '../components/AddCustomMaterialModal';

const API_URL = 'http://127.0.0.1:8000/api/';

const MaterialsDashboard = () => {
  const { authToken, user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  // Price update modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [priceFrance, setPriceFrance] = useState(0);
  const [priceMorocco, setPriceMorocco] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Custom material modal state
  const { isOpen: isAddMaterialOpen, onOpen: onAddMaterialOpen, onClose: onAddMaterialClose } = useDisclosure();
  
  const toast = useToast();

  // Color mode values
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (user && user.is_admin) {
      fetchMaterials();
    } else {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
    }
  }, [user]);

  const fetchMaterials = async () => {
    try {
      // Fetch materials and categories
      const [materialsResponse, categoriesResponse] = await Promise.all([
        axios.get(`${API_URL}materials/materials/?page_size=100`, {
          headers: { Authorization: `Token ${authToken}` }
        }),
        axios.get(`${API_URL}materials/categories/`, {
        headers: { Authorization: `Token ${authToken}` }
        })
      ]);
      
      const materialsData = Array.isArray(materialsResponse.data?.results) ? materialsResponse.data.results : 
                           Array.isArray(materialsResponse.data) ? materialsResponse.data : [];
      const categoriesData = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
      
      // Materials and categories data loaded successfully
      
      // Materials data structure verified
      
      setMaterials(materialsData);
      setCategories(categoriesData);
      setError(null);
    } catch (error) {
      // Failed to fetch materials
      setError('Failed to load materials data');
    } finally {
      setLoading(false);
    }
  };

  const getMaterialIcon = (materialName, categoryName) => {
    const name = materialName.toLowerCase();
    const category = categoryName?.toLowerCase() || '';
    
    // Specific material icons
    if (name.includes('laptop')) return MdLaptop;
    if (name.includes('desktop')) return MdDesktopMac;
    if (name.includes('printer')) return MdPrint;
    if (name.includes('router')) return MdRouter;
    if (name.includes('switch')) return MdNetworkCheck;
    if (name.includes('cable')) return MdCable;
    if (name.includes('server')) return MdStorage;
    if (name.includes('wifi') || name.includes('wireless')) return MdWifi;
    if (name.includes('video') || name.includes('camera')) return MdVideocam;
    if (name.includes('memory') || name.includes('ram')) return MdMemory;
    if (name.includes('storage') || name.includes('disk')) return MdStorage;
    if (name.includes('security')) return MdSecurity;
    if (name.includes('cloud')) return MdCloud;
    if (name.includes('network')) return MdNetworkCheck;
    if (name.includes('computer')) return MdComputer;
    if (name.includes('speed') || name.includes('performance')) return MdSpeed;
    if (name.includes('analytics') || name.includes('monitor')) return MdAnalytics;
    if (name.includes('auto') || name.includes('automatic')) return MdAutoGraph;
    if (name.includes('license') || name.includes('software')) return MdSettings;
    
    // Category-based icons
    if (category.includes('user') || category.includes('appareil')) return MdComputer;
    if (category.includes('infrastructure')) return MdRouter;
    if (category.includes('internet')) return MdWifi;
    if (category.includes('network')) return MdNetworkCheck;
    if (category.includes('server')) return MdStorage;
    if (category.includes('license')) return MdSettings;
    
    return MdInventory; // Default icon
  };

  const getMaterialGradient = (index) => {
    // Bouygues brand color gradients
    const gradients = [
      'linear(to-br, #FF6B35 0%, #20B2AA 100%)',
      'linear(to-br, #20B2AA 0%, #FF6B35 100%)',
      'linear(to-br, #FF6B35 0%, #e55a2b 100%)',
      'linear(to-br, #20B2AA 0%, #17a2b8 100%)',
      'linear(to-br, #FF6B35 0%, #ff8c42 100%)',
      'linear(to-br, #20B2AA 0%, #40e0d0 100%)',
      'linear(to-br, #e55a2b 0%, #FF6B35 100%)',
      'linear(to-br, #17a2b8 0%, #20B2AA 100%)',
      'linear(to-br, #ff8c42 0%, #FF6B35 100%)',
      'linear(to-br, #40e0d0 0%, #20B2AA 100%)',
    ];
    return gradients[index % gradients.length];
  };

  const getPriceDifferenceColor = (difference) => {
    if (difference > 0) return 'green.500';
    if (difference < 0) return 'red.500';
    return 'gray.500';
  };

  // Group materials by category for better organization
  const groupedMaterials = materials.reduce((groups, material) => {
    // Try different possible category field names
    const categoryName = material.category_name || 
                        (material.category && typeof material.category === 'object' ? material.category.name : null) ||
                        'Uncategorized';
    
    // Material category processed
    
    if (!groups[categoryName]) {
      groups[categoryName] = [];
    }
    groups[categoryName].push(material);
    return groups;
  }, {});

  // Materials grouped by category successfully

  // Ensure all categories are shown, even if they don't have materials
  const allCategoriesWithMaterials = categories.map(category => {
    const categoryMaterials = groupedMaterials[category.name] || [];
    // Category materials counted
    return {
      ...category,
      materials: categoryMaterials,
      materials_count: categoryMaterials.length
    };
  });

  // All categories processed successfully

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price_france':
        return b.price_france - a.price_france;
      case 'price_morocco':
        return b.price_morocco - a.price_morocco;
      case 'category':
        return (a.category_name || '').localeCompare(b.category_name || '');
      default:
        return 0;
    }
  });

  // Get materials grouped by category for display
  const getMaterialsByCategory = (categoryName) => {
    return groupedMaterials[categoryName] || [];
  };

  // Exchange rate (EUR to MAD) - you can make this dynamic by fetching from an API
  const EUR_TO_MAD_RATE = 11.2; // Approximate rate, should be fetched from API

  // Open price update modal
  const openPriceUpdateModal = (material) => {
    setSelectedMaterial(material);
    setPriceFrance(material.price_france || 0);
    setPriceMorocco(material.price_morocco || 0);
    onOpen();
  };

  // Handle price conversion
  const handlePriceChange = (field, value) => {
    if (field === 'france') {
      setPriceFrance(value);
      setPriceMorocco(Math.round(value * EUR_TO_MAD_RATE * 100) / 100);
    } else if (field === 'morocco') {
      setPriceMorocco(value);
      setPriceFrance(Math.round(value / EUR_TO_MAD_RATE * 100) / 100);
    }
  };

  // Update material prices
  const updateMaterialPrices = async () => {
    if (!selectedMaterial) return;

    setIsUpdating(true);
    try {
      const response = await axios.patch(
        `${API_URL}materials/materials/${selectedMaterial.id}/`,
        {
          price_france: priceFrance,
          price_morocco: priceMorocco,
        },
        {
          headers: { Authorization: `Token ${authToken}` }
        }
      );

      // Update the material in the local state
      setMaterials(prevMaterials =>
        prevMaterials.map(material =>
          material.id === selectedMaterial.id
            ? { ...material, price_france: priceFrance, price_morocco: priceMorocco }
            : material
        )
      );

      toast({
        title: "Prices Updated Successfully!",
        description: `${selectedMaterial.name} prices have been updated.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      onClose();
    } catch (error) {
      // Failed to update prices
      toast({
        title: "Update Failed",
        description: "Failed to update material prices. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsUpdating(false);
    }
  };


  // Add Internet Services materials
  const addInternetServices = async () => {
    // setIsAddingInternetServices(true); // Removed - function no longer used
    try {
      const internetServicesData = [
        // STARLINK Services
        {
          name: 'STARLINK 100MBps',
          category: 'Services',
          price_france: 200.00,
          price_morocco: 2000.00,
          is_auto_calculated: false,
          is_service: true,
          description: 'STARLINK Internet Connection - 100MBps download speed',
          unit: 'month'
        },
        {
          name: 'STARLINK 200MBps',
          category: 'Services',
          price_france: 350.00,
          price_morocco: 3500.00,
          is_auto_calculated: false,
          is_service: true,
          description: 'STARLINK Internet Connection - 200MBps download speed',
          unit: 'month'
        },
        {
          name: 'STARLINK 500MBps',
          category: 'Services',
          price_france: 600.00,
          price_morocco: 6000.00,
          is_auto_calculated: false,
          is_service: true,
          description: 'STARLINK Internet Connection - 500MBps download speed',
          unit: 'month'
        },
        {
          name: 'STARLINK 1GBps',
          category: 'Services',
          price_france: 1000.00,
          price_morocco: 10000.00,
          is_auto_calculated: false,
          is_service: true,
          description: 'STARLINK Internet Connection - 1GBps download speed',
          unit: 'month'
        },
        // Fiber Optic (FO) Services
        {
          name: 'FO 100MBps',
          category: 'Services',
          price_france: 150.00,
          price_morocco: 1500.00,
          is_auto_calculated: false,
          is_service: true,
          description: 'Fiber Optic Internet Connection - 100MBps download speed',
          unit: 'month'
        },
        {
          name: 'FO 200MBps',
          category: 'Services',
          price_france: 250.00,
          price_morocco: 2500.00,
          is_auto_calculated: false,
          is_service: true,
          description: 'Fiber Optic Internet Connection - 200MBps download speed',
          unit: 'month'
        },
        {
          name: 'FO 500MBps',
          category: 'Services',
          price_france: 400.00,
          price_morocco: 4000.00,
          is_auto_calculated: false,
          is_service: true,
          description: 'Fiber Optic Internet Connection - 500MBps download speed',
          unit: 'month'
        },
        {
          name: 'FO 1GBps',
          category: 'Services',
          price_france: 600.00,
          price_morocco: 6000.00,
          is_auto_calculated: false,
          is_service: true,
          description: 'Fiber Optic Internet Connection - 1GBps download speed',
          unit: 'month'
        },
        // VSAT Services
        {
          name: 'VSAT 100MBps',
          category: 'Services',
          price_france: 300.00,
          price_morocco: 3000.00,
          is_auto_calculated: false,
          is_service: true,
          description: 'VSAT Satellite Internet Connection - 100MBps download speed',
          unit: 'month'
        },
        {
          name: 'VSAT 200MBps',
          category: 'Services',
          price_france: 500.00,
          price_morocco: 5000.00,
          is_auto_calculated: false,
          is_service: true,
          description: 'VSAT Satellite Internet Connection - 200MBps download speed',
          unit: 'month'
        },
        {
          name: 'VSAT 500MBps',
          category: 'Services',
          price_france: 800.00,
          price_morocco: 8000.00,
          is_auto_calculated: false,
          is_service: true,
          description: 'VSAT Satellite Internet Connection - 500MBps download speed',
          unit: 'month'
        },
        {
          name: 'VSAT 1GBps',
          category: 'Services',
          price_france: 1200.00,
          price_morocco: 12000.00,
          is_auto_calculated: false,
          is_service: true,
          description: 'VSAT Satellite Internet Connection - 1GBps download speed',
          unit: 'month'
        },
        // Other Internet Services
        {
          name: 'AUTRE 100MBps',
          category: 'Services',
          price_france: 180.00,
          price_morocco: 1800.00,
          is_auto_calculated: false,
          is_service: true,
          description: 'Other Internet Connection - 100MBps download speed',
          unit: 'month'
        },
        {
          name: 'AUTRE 200MBps',
          category: 'Services',
          price_france: 300.00,
          price_morocco: 3000.00,
          is_auto_calculated: false,
          is_service: true,
          description: 'Other Internet Connection - 200MBps download speed',
          unit: 'month'
        },
        {
          name: 'AUTRE 500MBps',
          category: 'Services',
          price_france: 500.00,
          price_morocco: 5000.00,
          is_auto_calculated: false,
          is_service: true,
          description: 'Other Internet Connection - 500MBps download speed',
          unit: 'month'
        },
        {
          name: 'AUTRE 1GBps',
          category: 'Services',
          price_france: 800.00,
          price_morocco: 8000.00,
          is_auto_calculated: false,
          is_service: true,
          description: 'Other Internet Connection - 1GBps download speed',
          unit: 'month'
        },
      ];

      const response = await axios.post(
        `${API_URL}materials/bulk-create/`,
        { materials: internetServicesData },
        {
          headers: { Authorization: `Token ${authToken}` }
        }
      );

      // Refresh materials list
      await fetchMaterials();

      toast({
        title: "Internet Services Added Successfully!",
        description: `${response.data.created} new internet service materials have been added.`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });

    } catch (error) {
      // Failed to add internet services
      toast({
        title: "Failed to Add Internet Services",
        description: error.response?.data?.error || "Failed to add internet services. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      // setIsAddingInternetServices(false); // Removed - function no longer used
    }
  };

  // Delete material function - opens confirmation modal
  const handleDeleteMaterial = (material) => {
    setMaterialToDelete(material);
    setDeleteModalOpen(true);
  };

  // Confirm delete material function
  const confirmDeleteMaterial = async () => {
    if (!materialToDelete) return;

    setIsDeleting(true);
    try {
      const response = await axios.delete(`${API_URL}materials/custom-material/${materialToDelete.id}/`, {
        headers: { Authorization: `Token ${authToken}` }
      });

      // Show success message with cascade information
      const cascadeInfo = response.data.cascade_info;
      let successMessage = response.data.message;
      
      if (cascadeInfo && cascadeInfo.affected_projects.length > 0) {
        successMessage += `\n\nAffected projects: ${cascadeInfo.affected_projects.join(', ')}`;
      }
      
      toast({
        title: "Material Deleted Successfully!",
        description: successMessage,
        status: "success",
        duration: 6000, // Longer duration for important cascade info
        isClosable: true,
        position: "top-right",
      });

      // Refresh materials list
      fetchMaterials();
      
      // Close modal
      setDeleteModalOpen(false);
      setMaterialToDelete(null);
    } catch (error) {
      let errorTitle = "Failed to Delete Material";
      let errorDescription = "Failed to delete material. Please try again.";
      
      // Handle specific error cases
      if (error.response?.data?.error) {
        const backendError = error.response.data.error;
        
        if (backendError.includes("static/auto-calculated")) {
          errorTitle = "Cannot Delete Static Material";
          errorDescription = `"${materialToDelete?.name}" is a static material that cannot be deleted. Only custom materials can be deleted.`;
        } else if (backendError.includes("not found")) {
          errorTitle = "Material Not Found";
          errorDescription = "The material you're trying to delete no longer exists.";
        } else {
          errorDescription = backendError;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        status: "error",
        duration: 8000, // Longer duration for important messages
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel delete function
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setMaterialToDelete(null);
  };

  if (loading) {
    return (
      <Box minH="100vh" bgGradient="linear(to-br, #FF6B35 0%, #20B2AA 100%)" position="relative" overflow="hidden">
        {/* Animated Background */}
        <Box position="absolute" top="0" left="0" right="0" bottom="0" opacity="0.1">
          <Box position="absolute" top="20%" left="10%" w="200px" h="200px" borderRadius="full" bg="white" animation="float 6s ease-in-out infinite" />
          <Box position="absolute" top="60%" right="15%" w="150px" h="150px" borderRadius="full" bg="white" animation="float 8s ease-in-out infinite reverse" />
          <Box position="absolute" bottom="20%" left="20%" w="100px" h="100px" borderRadius="full" bg="white" animation="float 10s ease-in-out infinite" />
        </Box>
        
        <Center h="100vh" position="relative" zIndex="1">
          <VStack spacing={8}>
            <Box position="relative">
              <Box w="80px" h="80px" borderRadius="full" bg="white" opacity="0.2" animation="pulse 2s infinite" />
              <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
                <Spinner size="xl" color="white" thickness="4px" />
              </Box>
            </Box>
            <VStack spacing={2}>
              <Text color="white" fontSize="2xl" fontWeight="bold" textShadow="0 2px 4px rgba(0,0,0,0.3)">
                Loading Materials
              </Text>
              <Text color="white" opacity="0.8" fontSize="lg">
                Preparing your creative dashboard...
              </Text>
            </VStack>
        </VStack>
      </Center>
        
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.2; }
            50% { transform: scale(1.1); opacity: 0.3; }
          }
        `}</style>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bgGradient="linear(to-br, #FF6B35 0%, #e55a2b 100%)" position="relative">
        <Center h="100vh">
          <Box maxW="md" w="full" mx={4}>
            <Box
              bg="white"
              borderRadius="2xl"
              p={8}
              boxShadow="0 20px 60px rgba(0,0,0,0.2)"
              position="relative"
              overflow="hidden"
            >
              <Box position="absolute" top="-50px" right="-50px" w="100px" h="100px" borderRadius="full" bg="red.100" />
              <Box position="absolute" bottom="-30px" left="-30px" w="60px" h="60px" borderRadius="full" bg="red.50" />
              
              <VStack spacing={6} position="relative" zIndex="1">
                <Box p={4} borderRadius="full" bg="red.100">
                  <Icon as={MdError} w="32px" h="32px" color="red.500" />
                </Box>
                <VStack spacing={2} textAlign="center">
                  <Heading size="lg" color="gray.800">Oops! Something went wrong</Heading>
                  <Text color="gray.600" fontSize="sm">{error}</Text>
                </VStack>
                <Button
                  colorScheme="red"
                  variant="solid"
                  size="lg"
                  borderRadius="xl"
                  onClick={() => window.location.reload()}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)' }}
                  transition="all 0.3s ease"
                >
                  Try Again
                </Button>
              </VStack>
            </Box>
          </Box>
        </Center>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bgGradient="linear(to-br, #f8fafc 0%, #e2e8f0 100%)" position="relative">
      {/* Animated Background Elements */}
      <Box position="absolute" top="0" left="0" right="0" bottom="0" overflow="hidden" zIndex="0">
        <Box position="absolute" top="10%" left="5%" w="300px" h="300px" borderRadius="full" bg="rgba(255, 107, 53, 0.05)" animation="float 20s ease-in-out infinite" />
        <Box position="absolute" top="60%" right="10%" w="200px" h="200px" borderRadius="full" bg="rgba(32, 178, 170, 0.05)" animation="float 25s ease-in-out infinite reverse" />
        <Box position="absolute" bottom="20%" left="20%" w="150px" h="150px" borderRadius="full" bg="rgba(255, 107, 53, 0.05)" animation="float 30s ease-in-out infinite" />
      </Box>

      <Container maxW="container.xl" py={8} position="relative" zIndex="1">
        
        {/* Header with Add Custom Material Button */}
        <Flex justify="space-between" align="center" mb={8}>
          <VStack align="start" spacing={2}>
            <Heading 
              size="2xl" 
              bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
              bgClip="text"
              fontWeight="800"
            >
              Materials Dashboard
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Manage and organize your project materials
            </Text>
          </VStack>
          
          <Button
            leftIcon={<Icon as={MdAdd} />}
            bgGradient="linear(135deg, #FF6B35 0%, #20B2AA 100%)"
            color="white"
            size="lg"
            borderRadius="xl"
            boxShadow="0 8px 25px rgba(255, 107, 53, 0.3)"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 12px 35px rgba(255, 107, 53, 0.4)"
            }}
            _active={{
              transform: "translateY(0px)"
            }}
            transition="all 0.3s ease"
            fontWeight="700"
            onClick={onAddMaterialOpen}
          >
            Add Custom Material
          </Button>
        </Flex>

        {/* Ultra-Creative Category-Based Materials Display */}
        <VStack spacing={8} align="stretch">
          {allCategoriesWithMaterials.map((category, categoryIndex) => {
            const categoryMaterials = category.materials || [];
            const categoryGradient = getMaterialGradient(categoryIndex);
            const CategoryIcon = getMaterialIcon(category.name, category.name);
            
            return (
              <Box key={category.id} position="relative">
                {/* Category Header */}
                <Box
                  mb={6}
                  p={6}
                  bgGradient={categoryGradient}
                  borderRadius="2xl"
                  position="relative"
                  overflow="hidden"
                  boxShadow="0 12px 40px rgba(0,0,0,0.15)"
                >
                  {/* Background Pattern */}
                  <Box
                    position="absolute"
                    top="-30px"
                    right="-30px"
                    w="120px"
                    h="120px"
                    bg="white"
                    opacity="0.1"
                    borderRadius="full"
                    transform="scale(0.8)"
                  />
                  <Box
                    position="absolute"
                    bottom="-20px"
                    left="-20px"
                    w="80px"
                    h="80px"
                    bg="white"
                    opacity="0.05"
                    borderRadius="full"
                    transform="scale(0.6)"
                  />
                  
                  <Flex align="center" justify="space-between" position="relative" zIndex={2}>
                    <HStack spacing={4}>
                      <Box
                        p={4}
                        bg="rgba(255, 255, 255, 0.25)"
                        borderRadius="xl"
                        backdropFilter="blur(20px)"
                        border="1px solid"
                        borderColor="rgba(255, 255, 255, 0.3)"
                        boxShadow="0 8px 32px rgba(0,0,0,0.1)"
                      >
                        <Icon as={CategoryIcon} w="32px" h="32px" color="white" />
                      </Box>
                      <VStack align="start" spacing={1}>
                        <Heading 
                          size="xl" 
                          color="white" 
                          fontWeight="black"
                          textShadow="0 2px 4px rgba(0,0,0,0.3)"
                        >
                          {category.name}
                        </Heading>
                        <Text color="white" opacity="0.9" fontSize="lg" fontWeight="medium">
                          {categoryMaterials.length} {categoryMaterials.length === 1 ? 'material' : 'materials'} available
            </Text>
          </VStack>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <Badge
                        bg="rgba(255, 255, 255, 0.25)"
                        color="white"
                        borderRadius="full"
                        px={4}
                        py={2}
                        fontSize="sm"
                        fontWeight="bold"
                        backdropFilter="blur(20px)"
                        border="1px solid"
                        borderColor="rgba(255, 255, 255, 0.3)"
                      >
                        {categoryMaterials.length} materials
                      </Badge>
                    </HStack>
        </Flex>
                </Box>

                {/* Materials Grid for this Category */}
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }} gap={6}>
                  {categoryMaterials.map((material, materialIndex) => {
                    const MaterialIcon = getMaterialIcon(material.name, material.category_name);
                    const materialGradient = getMaterialGradient(materialIndex);
                    const priceDifference = material.price_difference_percentage || 0;
                    
                    return (
                      <Box
                        key={material.id}
                        position="relative"
                        cursor="pointer"
                        _hover={{
                          transform: 'translateY(-8px) scale(1.02)',
                        }}
                        transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                        role="group"
                      >
                        {/* Floating Background Effect */}
                        <Box
                          position="absolute"
                          top="0"
                          left="0"
                          right="0"
                          bottom="0"
                          bgGradient={materialGradient}
                          borderRadius="2xl"
                          opacity="0.1"
                          transform="scale(0.95)"
                          transition="all 0.4s ease"
                          sx={{
                            '[role="group"]:hover &': {
                              opacity: '0.2',
                              transform: 'scale(1.05)',
                            }
                          }}
                        />
                        
                        <Card
                          bg={cardBg}
                          borderRadius="2xl"
                          overflow="hidden"
                          boxShadow="0 8px 32px rgba(0,0,0,0.12)"
                          border="1px solid"
                          borderColor="gray.100"
                          transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                          position="relative"
                          zIndex={2}
                          sx={{
                            '[role="group"]:hover &': {
                              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                              borderColor: 'transparent',
                            }
                          }}
                        >
                          {/* Enhanced Gradient Header */}
                          <Box
                            h="120px"
                            bgGradient={materialGradient}
                            position="relative"
                            overflow="hidden"
                          >
                            {/* Animated Background Pattern */}
                            <Box
                              position="absolute"
                              top="-20px"
                              right="-20px"
                              w="80px"
                              h="80px"
                              bg="white"
                              opacity="0.1"
                              borderRadius="full"
                              transform="scale(0)"
                              transition="transform 0.8s ease"
                              sx={{
                                '[role="group"]:hover &': { transform: 'scale(1.5)' }
                              }}
                            />
                            
                            <Flex justify="space-between" align="start" p={5} h="full" position="relative" zIndex={2}>
                              <VStack align="start" spacing={2} flex={1}>
                                {/* Enhanced Icon Container */}
                                <Box
                                  p={3}
                                  bg="rgba(255, 255, 255, 0.25)"
                                  borderRadius="xl"
                                  backdropFilter="blur(20px)"
                                  border="1px solid"
                                  borderColor="rgba(255, 255, 255, 0.3)"
                                  boxShadow="0 8px 32px rgba(0,0,0,0.1)"
                                  transition="all 0.3s ease"
                                  sx={{
                                    '[role="group"]:hover &': {
                                      transform: 'rotate(5deg) scale(1.1)',
                                      bg: 'rgba(255, 255, 255, 0.35)',
                                    }
                                  }}
                                >
                                  <Icon as={MaterialIcon} w="24px" h="24px" color="white" />
                                </Box>
                                
                                <VStack align="start" spacing={1}>
                                  <Text 
                                    color="white" 
                                    fontWeight="bold" 
                                    fontSize="lg"
                                    textShadow="0 2px 4px rgba(0,0,0,0.3)"
                                    transition="transform 0.3s ease"
                                    sx={{
                                      '[role="group"]:hover &': { transform: 'translateX(4px)' }
                                    }}
                                    noOfLines={2}
                                  >
                                    {material.name}
                                  </Text>
                                  <HStack spacing={2}>
                                    <Icon as={MdCategory} w="14px" h="14px" color="white" opacity="0.8" />
                                    <Text color="white" opacity="0.9" fontSize="sm" fontWeight="medium">
                                      {category.name}
                                    </Text>
                                  </HStack>
                                </VStack>
                              </VStack>
                            </Flex>
                          </Box>

                          {/* Enhanced Card Body */}
                          <CardBody p={5}>
                            <VStack align="start" spacing={4}>
                              {/* Description */}
                              <Text 
                                color="gray.600" 
                                fontSize="sm" 
                                lineHeight="1.5"
                                noOfLines={2}
                                transition="color 0.3s ease"
                                sx={{
                                  '[role="group"]:hover &': { color: 'gray.700' }
                                }}
                              >
                                {material.description || 'No description available'}
                              </Text>
                              
                              {/* Price Information */}
                              <VStack spacing={3} w="full">
                                <HStack justify="space-between" w="full">
                                  <HStack spacing={2}>
                                    <Icon as={MdEuro} w="16px" h="16px" color="gray.400" />
                                    <Text fontSize="sm" color="gray.500" fontWeight="medium">
                                      France
                                    </Text>
                                  </HStack>
                                  <Text fontSize="lg" fontWeight="bold" color="#FF6B35">
                                    €{material.price_france}
                                  </Text>
                                </HStack>
                                
                                <HStack justify="space-between" w="full">
                                  <HStack spacing={2}>
                                    <Icon as={MdLocalAtm} w="16px" h="16px" color="gray.400" />
                                    <Text fontSize="sm" color="gray.500" fontWeight="medium">
                                      Morocco
                                    </Text>
                                  </HStack>
                                  <Text fontSize="lg" fontWeight="bold" color="#20B2AA">
                                    {material.price_morocco} MAD
                                  </Text>
                                </HStack>
                                
                                {/* Price Difference */}
                                <HStack justify="space-between" w="full">
                                  <HStack spacing={2}>
                                    <Icon 
                                      as={priceDifference > 0 ? MdTrendingUp : MdTrendingDown} 
                                      w="16px" 
                                      h="16px" 
                                      color={getPriceDifferenceColor(priceDifference)} 
                                    />
                                    <Text fontSize="sm" color="gray.500" fontWeight="medium">
                                      Difference
                                    </Text>
                                  </HStack>
                                  <Text 
                                    fontSize="sm" 
                                    fontWeight="bold" 
                                    color={getPriceDifferenceColor(priceDifference)}
                                  >
                                    {priceDifference > 0 ? '+' : ''}{priceDifference.toFixed(1)}%
                                  </Text>
                                </HStack>
                              </VStack>
                              
                              {/* Status and Actions */}
                              <HStack justify="space-between" w="full">
                                <Badge
                                  colorScheme={material.is_active ? 'green' : 'gray'}
                                  borderRadius="full"
                                  px={3}
                                  py={1}
                                  fontSize="xs"
                                  fontWeight="bold"
                                >
                                  {material.is_active ? '🟢 Active' : '⚫ Inactive'}
                        </Badge>
                                
                                <HStack spacing={2}>
                                  <Tooltip label="Update Prices">
                                    <IconButton
                                      aria-label="Update Prices"
                                      icon={<Icon as={MdAttachMoney} />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="blue"
                                      borderRadius="full"
                                      _hover={{
                                        bg: 'blue.100',
                                        transform: 'scale(1.1)',
                                        boxShadow: '0 4px 12px rgba(66, 153, 225, 0.3)',
                                      }}
                                      transition="all 0.3s ease"
                                      onClick={() => openPriceUpdateModal(material)}
                                    />
                                  </Tooltip>
                                  
                                  {/* Delete button - only for non-static materials */}
                                  {!material.is_auto_calculated && (
                                    <Tooltip label="Delete Material">
                                      <IconButton
                                        aria-label="Delete Material"
                                        icon={<Icon as={MdDelete} />}
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="red"
                                        borderRadius="full"
                                        _hover={{
                                          bg: 'red.100',
                                          transform: 'scale(1.1)',
                                          boxShadow: '0 4px 12px rgba(245, 101, 101, 0.3)',
                                        }}
                                        transition="all 0.3s ease"
                                        onClick={() => handleDeleteMaterial(material)}
                                      />
                                    </Tooltip>
                                  )}
                                  
                                  {material.is_auto_calculated && (
                                    <Tooltip label="Auto Calculated">
                                      <Icon as={MdAutoGraph} w="16px" h="16px" color="blue.500" />
                                    </Tooltip>
                                  )}
                                  {material.is_service && (
                                    <Tooltip label="Service">
                                      <Icon as={MdSettings} w="16px" h="16px" color="purple.500" />
                                    </Tooltip>
                                  )}
                                </HStack>
                              </HStack>
                            </VStack>
          </CardBody>
        </Card>
                      </Box>
                    );
                  })}
                </Grid>
              </Box>
            );
          })}
        </VStack>

        {/* Empty State */}
        {sortedMaterials.length === 0 && !loading && (
          <Center py={20}>
            <VStack spacing={6}>
              <Box
                p={8}
                borderRadius="full"
                bgGradient="linear(to-br, #FF6B35 0%, #20B2AA 100%)"
                boxShadow="0 8px 32px rgba(79, 172, 254, 0.3)"
              >
                <Icon as={MdInventory} w="48px" h="48px" color="white" />
              </Box>
              <VStack spacing={2}>
                <Heading size="lg" color={textColor}>
                  {searchTerm || selectedCategory ? 'No materials found' : 'No materials yet'}
                </Heading>
                <Text color="gray.500" textAlign="center">
                  {searchTerm || selectedCategory 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Materials will appear here once they are added to the system'
                  }
                </Text>
              </VStack>
            </VStack>
          </Center>
        )}
      </Container>
      
      {/* Ultra-Creative Price Update Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent
          borderRadius="3xl"
          boxShadow="0 25px 50px rgba(0,0,0,0.25)"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.2)"
          bg="rgba(255, 255, 255, 0.95)"
          backdropFilter="blur(20px)"
          overflow="hidden"
          position="relative"
        >
          {/* Animated Background */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bgGradient="linear(to-br, #FF6B35 0%, #20B2AA 100%)"
            opacity="0.05"
            zIndex="0"
          />
          <Box
            position="absolute"
            top="-50px"
            right="-50px"
            w="100px"
            h="100px"
            bgGradient="linear(to-br, #FF6B35 0%, #20B2AA 100%)"
            borderRadius="full"
            opacity="0.1"
            animation="float 6s ease-in-out infinite"
          />
          
          <ModalHeader
            position="relative"
            zIndex="1"
            bg="transparent"
            borderBottom="none"
            pb={0}
          >
            <VStack spacing={4} align="center">
              <Box
                p={4}
                borderRadius="2xl"
                bgGradient="linear(to-br, #FF6B35 0%, #20B2AA 100%)"
                boxShadow="0 8px 25px rgba(0,0,0,0.15)"
                _hover={{
                  transform: 'rotate(5deg) scale(1.05)',
                }}
                transition="all 0.3s ease"
              >
                <Icon as={MdAttachMoney} w="32px" h="32px" color="white" />
              </Box>
              <VStack spacing={2} textAlign="center">
                <Heading
                  size="xl"
                  bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
                  bgClip="text"
                  fontWeight="black"
                >
                  Update Prices
                </Heading>
                <Text color="gray.600" fontSize="lg" fontWeight="medium">
                  {selectedMaterial?.name}
                </Text>
                <Text color="gray.500" fontSize="sm">
                  💱 Automatic EUR ↔ MAD conversion enabled
                </Text>
              </VStack>
            </VStack>
          </ModalHeader>

          <ModalCloseButton
            position="absolute"
            top={4}
            right={4}
            size="lg"
            borderRadius="full"
            bg="rgba(255, 255, 255, 0.8)"
            _hover={{
              bg: "rgba(255, 107, 53, 0.1)",
              transform: "scale(1.1)",
            }}
            transition="all 0.3s ease"
          />

          <ModalBody position="relative" zIndex="1" pt={0}>
            <VStack spacing={6}>
              {/* Exchange Rate Display */}
              <Box
                p={4}
                bg="rgba(32, 178, 170, 0.1)"
                borderRadius="xl"
                border="1px solid"
                borderColor="rgba(32, 178, 170, 0.2)"
                w="full"
                textAlign="center"
              >
                <HStack justify="center" spacing={2}>
                  <Icon as={MdAutoGraph} w="20px" h="20px" color="#20B2AA" />
                  <Text fontSize="sm" fontWeight="bold" color="#20B2AA">
                    Current Exchange Rate: 1 EUR = {EUR_TO_MAD_RATE} MAD
                  </Text>
                </HStack>
              </Box>

              {/* Price Input Fields */}
              <Grid templateColumns="1fr 1fr" gap={6} w="full">
                {/* France Price */}
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="bold"
                    color="gray.700"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <Icon as={MdEuro} w="16px" h="16px" color="#FF6B35" />
                    France Price (EUR)
                  </FormLabel>
                  <NumberInput
                    value={priceFrance}
                    onChange={(valueString, valueNumber) => handlePriceChange('france', valueNumber)}
                    precision={2}
                    step={0.01}
                    min={0}
                  >
                    <NumberInputField
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: '#FF6B35',
                        boxShadow: '0 0 0 3px rgba(255, 107, 53, 0.1)',
                      }}
                      _hover={{
                        borderColor: '#FF6B35',
                      }}
                      transition="all 0.3s ease"
                      fontSize="lg"
                      fontWeight="bold"
                      textAlign="center"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                {/* Morocco Price */}
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="bold"
                    color="gray.700"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <Icon as={MdLocalAtm} w="16px" h="16px" color="#20B2AA" />
                    Morocco Price (MAD)
                  </FormLabel>
                  <NumberInput
                    value={priceMorocco}
                    onChange={(valueString, valueNumber) => handlePriceChange('morocco', valueNumber)}
                    precision={2}
                    step={0.01}
                    min={0}
                  >
                    <NumberInputField
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: '#20B2AA',
                        boxShadow: '0 0 0 3px rgba(32, 178, 170, 0.1)',
                      }}
                      _hover={{
                        borderColor: '#20B2AA',
                      }}
                      transition="all 0.3s ease"
                      fontSize="lg"
                      fontWeight="bold"
                      textAlign="center"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </Grid>

              {/* Conversion Preview */}
              <Box
                p={4}
                bg="rgba(255, 107, 53, 0.05)"
                borderRadius="xl"
                border="1px solid"
                borderColor="rgba(255, 107, 53, 0.1)"
                w="full"
              >
                <VStack spacing={2}>
                  <Text fontSize="sm" fontWeight="bold" color="gray.600">
                    💡 Live Conversion Preview
                  </Text>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.500">
                      €{priceFrance} EUR
                    </Text>
                    <Icon as={MdAutoGraph} w="16px" h="16px" color="#FF6B35" />
                    <Text fontSize="sm" color="gray.500">
                      {priceMorocco} MAD
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter
            position="relative"
            zIndex="1"
            borderTop="none"
            pt={0}
            justifyContent="center"
          >
            <HStack spacing={4}>
              <Button
                variant="outline"
                onClick={onClose}
                borderRadius="xl"
                border="2px solid"
                borderColor="gray.200"
                _hover={{
                  borderColor: "gray.400",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.3s ease"
                fontWeight="semibold"
              >
                Cancel
              </Button>
              <Button
                bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
                color="white"
                borderRadius="xl"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(255, 107, 53, 0.4)",
                }}
                _active={{
                  transform: "translateY(0px)",
                }}
                transition="all 0.3s ease"
                fontWeight="bold"
                isLoading={isUpdating}
                loadingText="Updating..."
                onClick={updateMaterialPrices}
                leftIcon={<Icon as={MdAttachMoney} />}
              >
                Update Prices
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Custom Material Modal */}
      <AddCustomMaterialModal 
        isOpen={isAddMaterialOpen} 
        onClose={onAddMaterialClose}
        onSuccess={() => {
          fetchMaterials(); // Refresh materials list
          toast({
            title: "Success!",
            description: "Custom material has been added successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={cancelDelete} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent
          bg="white"
          borderRadius="2xl"
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          border="1px solid"
          borderColor="gray.200"
          mx={4}
        >
          <ModalHeader
            bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
            color="white"
            borderRadius="2xl 2xl 0 0"
            textAlign="center"
            py={6}
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-50%"
              left="-50%"
              width="200%"
              height="200%"
              bg="white"
              opacity="0.1"
              borderRadius="50%"
              animation="pulse 2s infinite"
            />
            <Heading size="lg" position="relative" zIndex="1">
              🗑️ Delete Material
            </Heading>
          </ModalHeader>

          <ModalCloseButton
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            position="absolute"
            top={4}
            right={4}
            zIndex="2"
          />

          <ModalBody py={8} textAlign="center">
            <VStack spacing={6}>
              <Box
                p={6}
                bg="red.50"
                borderRadius="xl"
                border="2px solid"
                borderColor="red.200"
                w="full"
              >
                <Text fontSize="lg" fontWeight="semibold" color="red.800" mb={2}>
                  ⚠️ Warning: This action cannot be undone!
                </Text>
                <Text color="gray.700" fontSize="md">
                  Are you sure you want to delete <strong>"{materialToDelete?.name}"</strong>?
                </Text>
                <Text color="gray.600" fontSize="sm" mt={2}>
                  This material will be permanently removed from the system.
                </Text>
                <Text color="orange.600" fontSize="sm" mt={2} fontWeight="semibold">
                  ⚠️ If this material is used in any projects, it will be automatically removed from those projects and their budgets will be recalculated.
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter
            bg="gray.50"
            borderRadius="0 0 2xl 2xl"
            py={6}
            justifyContent="center"
            gap={4}
          >
            <Button
              variant="outline"
              borderColor="gray.300"
              color="gray.700"
              borderRadius="xl"
              px={8}
              py={3}
              _hover={{
                bg: "gray.100",
                borderColor: "gray.400",
                transform: "translateY(-1px)",
              }}
              _active={{
                transform: "translateY(0px)",
              }}
              transition="all 0.3s ease"
              fontWeight="semibold"
              onClick={cancelDelete}
              isDisabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              bgGradient="linear(to-r, #e53e3e 0%, #c53030 100%)"
              color="white"
              borderRadius="xl"
              px={8}
              py={3}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(229, 62, 62, 0.4)",
              }}
              _active={{
                transform: "translateY(0px)",
              }}
              transition="all 0.3s ease"
              fontWeight="bold"
              isLoading={isDeleting}
              loadingText="Deleting..."
              onClick={confirmDeleteMaterial}
            >
              🗑️ Delete Material
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Global CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.3; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
          50% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.6); }
        }
      `}</style>
    </Box>
  );
};

export default MaterialsDashboard;
