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
  IconButton,
  Tooltip,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Image,
  Avatar,
  Wrap,
  WrapItem,
  useColorModeValue,
  Input,
} from '@chakra-ui/react';
import {
  MdCategory,
  MdTrendingUp,
  MdTrendingDown,
  MdAttachMoney,
  MdInventory,
  MdDateRange,
  MdStar,
  MdStarBorder,
  MdRefresh,
  MdSearch,
  MdFilterList,
  MdSort,
  MdVisibility,
  MdComputer,
  MdRouter,
  MdStorage,
  MdWifi,
  MdNetworkCheck,
  MdSettings,
  MdVideocam,
  MdPrint,
  MdCable,
  MdMemory,
  MdSecurity,
  MdCloud,
  MdSpeed,
  MdAnalytics,
  MdAutoGraph,
  MdDesktopMac,
  MdLaptop,
} from 'react-icons/md';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

const CategoriesDashboard = () => {
  const { user, authToken } = useAuth();
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const textColor = useColorModeValue('gray.800', 'white');
  const bg = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    if (user && authToken) {
      fetchCategories();
    } else {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const [categoriesResponse, materialsResponse] = await Promise.all([
        axios.get(`${API_URL}materials/categories/`, {
          headers: { Authorization: `Token ${authToken}` }
        }),
        axios.get(`${API_URL}materials/materials/?page_size=100`, {
        headers: { Authorization: `Token ${authToken}` }
        })
      ]);
      
      const categoriesData = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
      const materialsData = Array.isArray(materialsResponse.data?.results) ? materialsResponse.data.results : 
                           Array.isArray(materialsResponse.data) ? materialsResponse.data : [];
      
      setCategories(categoriesData);
      setMaterials(materialsData);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Failed to load categories data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Infrastructure': MdRouter,
      'Équipement Réseau': MdNetworkCheck,
      'Équipement Serveur': MdStorage,
      'Appareils Utilisateur': MdComputer,
      'Licences Logicielles': MdSettings,
      'Services': MdCloud,
      'Visioconférence': MdVideocam,
      'Network': MdNetworkCheck,
      'Server': MdComputer,
    };
    return icons[categoryName] || MdCategory;
  };

  const getCategoryGradient = (index) => {
    const gradients = [
      'linear(to-br, #FF6B35 0%, #20B2AA 100%)',
      'linear(to-br, #20B2AA 0%, #FF6B35 100%)',
      'linear(to-br, #FF6B35 0%, #e55a2b 100%)',
      'linear(to-br, #20B2AA 0%, #17a2b8 100%)',
      'linear(to-br, #FF6B35 0%, #ff8c42 100%)',
      'linear(to-br, #20B2AA 0%, #40e0d0 100%)',
      'linear(to-br, #e55a2b 0%, #FF6B35 100%)',
      'linear(to-br, #17a2b8 0%, #20B2AA 100%)',
    ];
    return gradients[index % gradients.length];
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMaterialsByCategory = (categoryName) => {
    return materials.filter(material => 
      material.category_name === categoryName || 
      material.category?.name === categoryName
    );
  };

  if (loading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading categories...</Text>
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

  return (
    <Box minH="100vh" bgGradient="linear(to-br, #f8fafc 0%, #e2e8f0 100%)" position="relative" overflow="hidden">
      {/* Bouygues Brand Animated Background */}
      <Box position="absolute" top="0" left="0" right="0" bottom="0" overflow="hidden" zIndex="0">
        <Box position="absolute" top="10%" left="5%" w="300px" h="300px" borderRadius="full" bg="rgba(255, 107, 53, 0.05)" animation="float 20s ease-in-out infinite" />
        <Box position="absolute" top="60%" right="10%" w="200px" h="200px" borderRadius="full" bg="rgba(32, 178, 170, 0.05)" animation="float 25s ease-in-out infinite reverse" />
        <Box position="absolute" bottom="20%" left="20%" w="150px" h="150px" borderRadius="full" bg="rgba(255, 107, 53, 0.05)" animation="float 30s ease-in-out infinite" />
      </Box>

      <Container maxW="container.xl" py={8} position="relative" zIndex="1" overflow="hidden">
        {/* Ultra-Creative Modern Header */}
        <Box mb={12} position="relative" zIndex="1">
        <Flex justify="space-between" align="center" mb={8}>
            <VStack align="start" spacing={4}>
              <HStack spacing={6}>
                <Box
                  p={4}
                  borderRadius="2xl"
                  bgGradient="linear(to-br, #FF6B35 0%, #20B2AA 100%)"
                  boxShadow="0 12px 40px rgba(255, 107, 53, 0.4)"
                  position="relative"
                  _hover={{
                    transform: 'rotate(5deg) scale(1.05)',
                    boxShadow: '0 20px 60px rgba(255, 107, 53, 0.6)',
                  }}
                  transition="all 0.3s ease"
                >
                  <Icon as={MdCategory} w="36px" h="36px" color="white" />
                </Box>
                
          <VStack align="start" spacing={2}>
                  <Heading 
                    size="3xl" 
                    color={textColor} 
                    fontWeight="black"
                    bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
                    bgClip="text"
                    textShadow="0 2px 4px rgba(0,0,0,0.1)"
                  >
                    Infrastructure Categories
              </Heading>
                  <Text color="gray.500" fontSize="xl" fontWeight="medium">
                    🚀 Explore your IT infrastructure organization
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            <Button
              leftIcon={<Icon as={MdRefresh} />}
              size="lg"
              bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
              color="white"
              borderRadius="xl"
              px={8}
              py={6}
              fontSize="lg"
              fontWeight="bold"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 15px 35px rgba(255, 107, 53, 0.4)',
              }}
              _active={{
                transform: 'translateY(0px)',
              }}
              transition="all 0.3s ease"
              onClick={fetchCategories}
            >
              Refresh Data
            </Button>
          </Flex>
        </Box>


        {/* Ultra-Advanced Creative Categories Display */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} w="100%" maxW="100%">
          {filteredCategories.map((category, index) => {
            const gradient = getCategoryGradient(index);
            const IconComponent = getCategoryIcon(category.name);
            const materialsInCategory = getMaterialsByCategory(category.name);
            
            return (
              <Box
                key={category.id}
                position="relative"
                cursor="pointer"
                w="100%"
                maxW="100%"
                _hover={{
                  transform: 'translateY(-20px) scale(1.05)',
                }}
                transition="all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
                role="group"
              >
                {/* Floating Background Effect */}
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  bgGradient={gradient}
                  borderRadius="3xl"
                  opacity="0.1"
                  _groupHover={{
                    opacity: '0.2',
                  }}
                  transition="opacity 0.4s ease"
                />
                
                {/* Glassmorphism Card */}
                <Box
                  bg="rgba(255, 255, 255, 0.9)"
                  backdropFilter="blur(20px)"
                  borderRadius="3xl"
                  border="1px solid"
                  borderColor="rgba(255, 255, 255, 0.3)"
                  boxShadow="0 20px 60px rgba(0,0,0,0.1)"
                  overflow="hidden"
                  position="relative"
                  h="full"
                  _groupHover={{
                    boxShadow: '0 30px 80px rgba(255, 107, 53, 0.2)',
                    borderColor: 'rgba(255, 107, 53, 0.3)',
                  }}
                  transition="all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  {/* Animated Background Pattern */}
                  <Box
                    position="absolute"
                    top="-50px"
                    right="-50px"
                    w="100px"
                    h="100px"
                    bgGradient={gradient}
                    borderRadius="full"
                    opacity="0.1"
                    _groupHover={{
                      transform: 'scale(1.5) rotate(180deg)',
                      opacity: '0.2',
                    }}
                    transition="all 0.8s ease"
                  />
                  
                  <Box p={6}>
                    {/* Header Section */}
                    <Flex justify="space-between" align="start" mb={4}>
                      <HStack spacing={3}>
                        <Box
                          p={3}
                          borderRadius="2xl"
                          bgGradient={gradient}
                          boxShadow="0 8px 25px rgba(0,0,0,0.15)"
                          position="relative"
                          _groupHover={{
                            transform: 'scale(1.1) rotate(10deg)',
                            boxShadow: '0 12px 35px rgba(0,0,0,0.25)',
                          }}
                          transition="all 0.4s ease"
                        >
                          <Icon as={IconComponent} w="20px" h="20px" color="white" />
                          {/* Floating Particles */}
                          <Box
                            position="absolute"
                            top="-5px"
                            right="-5px"
                            w="12px"
                            h="12px"
                            bg="white"
                            borderRadius="full"
                            opacity="0.8"
                            _groupHover={{
                              transform: 'scale(1.5)',
                              opacity: '1',
                            }}
                            transition="all 0.3s ease"
                          />
                        </Box>
                        <VStack align="start" spacing={1}>
                          <Text 
                            fontSize="lg" 
                            fontWeight="black" 
                            color={textColor}
                            bgGradient={gradient}
                            bgClip="text"
                            _groupHover={{
                              transform: 'translateX(5px)',
                            }}
                            transition="all 0.3s ease"
                          >
                            {category.name}
                          </Text>
                          <Text fontSize="sm" color="gray.500" noOfLines={2} lineHeight="1.4">
                            {category.description || 'No description available'}
                          </Text>
                        </VStack>
            </HStack>
                      
                      <VStack spacing={2} align="end">
                        <Badge
                          bgGradient={gradient}
                          color="white"
                          borderRadius="full"
                          px={4}
                          py={2}
                          fontSize="sm"
                          fontWeight="bold"
                          boxShadow="0 4px 15px rgba(0,0,0,0.2)"
                          _groupHover={{
                            transform: 'scale(1.1)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                          }}
                          transition="all 0.3s ease"
                        >
                          {category.materials_count || 0} materials
                        </Badge>
                        <Text fontSize="xs" color="gray.400" fontWeight="medium">
                          {materialsInCategory.length > 0 ? `${materialsInCategory.length} active` : 'No materials'}
            </Text>
          </VStack>
        </Flex>

                    {/* Progress Bar */}
                    <Box mb={6}>
                      <HStack justify="space-between" mb={3}>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">
                          Category Health
                        </Text>
                        <Text fontSize="sm" color="gray.500" fontWeight="semibold">
                          {Math.round((category.materials_count || 0) / Math.max(categories.reduce((sum, cat) => sum + (cat.materials_count || 0), 0), 1) * 100)}%
                        </Text>
                      </HStack>
                      <Box
                        w="full"
                        h="8px"
                        bg="rgba(0,0,0,0.1)"
                        borderRadius="full"
                        overflow="hidden"
                        position="relative"
                      >
                        <Box
                          w={`${Math.min((category.materials_count || 0) / Math.max(categories.reduce((sum, cat) => sum + (cat.materials_count || 0), 0), 1) * 100, 100)}%`}
                          h="full"
                          bgGradient={gradient}
                          borderRadius="full"
                          transition="width 1s ease"
                          position="relative"
                          _groupHover={{
                            boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)',
                          }}
                        >
                          {/* Shimmer Effect */}
                          <Box
                            position="absolute"
                            top="0"
                            left="-100%"
                            w="100%"
                            h="100%"
                            bgGradient="linear(to-r, transparent, rgba(255,255,255,0.4), transparent)"
                            _groupHover={{
                              left: '100%',
                            }}
                            transition="left 0.8s ease"
                          />
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Materials Preview */}
                    {materialsInCategory.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>
                          Recent Materials:
                        </Text>
                        <Wrap spacing={1} w="100%" maxW="100%">
                          {materialsInCategory.slice(0, 4).map((material, matIndex) => (
                            <WrapItem key={material.id}>
                              <Box
                                px={2}
                                py={1}
                                bg="rgba(255, 255, 255, 0.8)"
                                borderRadius="full"
                                border="1px solid"
                                borderColor="rgba(255, 107, 53, 0.2)"
                                fontSize="xs"
                                color="gray.600"
                                fontWeight="medium"
                                maxW="100px"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                whiteSpace="nowrap"
                                _groupHover={{
                                  bg: 'white',
                                  borderColor: '#FF6B35',
                                  transform: 'scale(1.05)',
                                  boxShadow: '0 2px 8px rgba(255, 107, 53, 0.2)',
                                }}
                                transition="all 0.3s ease"
                                style={{
                                  transitionDelay: `${matIndex * 0.1}s`
                                }}
                                title={material.name}
                              >
                                {material.name}
                              </Box>
                            </WrapItem>
                          ))}
                          {materialsInCategory.length > 4 && (
                            <WrapItem>
                              <Box
                                px={2}
                                py={1}
                                bg="rgba(32, 178, 170, 0.1)"
                                borderRadius="full"
                                border="1px solid"
                                borderColor="rgba(32, 178, 170, 0.3)"
                                fontSize="xs"
                                color="#20B2AA"
                                fontWeight="bold"
                                _groupHover={{
                                  bg: 'rgba(32, 178, 170, 0.2)',
                                  transform: 'scale(1.05)',
                                }}
                                transition="all 0.3s ease"
                              >
                                +{materialsInCategory.length - 4} more
                              </Box>
                            </WrapItem>
                          )}
                        </Wrap>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Grid>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <Center py={20}>
            <VStack spacing={6}>
              <Box
                p={8}
                borderRadius="full"
                bgGradient="linear(to-br, #FF6B35 0%, #20B2AA 100%)"
                boxShadow="0 8px 32px rgba(255, 107, 53, 0.3)"
              >
                <Icon as={MdCategory} w="48px" h="48px" color="white" />
              </Box>
              <VStack spacing={2}>
                <Heading size="lg" color={textColor}>
                  No categories found
                </Heading>
                <Text color="gray.500" textAlign="center" maxW="md">
                  {searchTerm ? 'Try adjusting your search terms' : 'No categories available at the moment'}
                </Text>
              </VStack>
            </VStack>
          </Center>
        )}
      </Container>
      
      {/* Global CSS to prevent horizontal scrolling */}
      <style>{`
        body {
          overflow-x: hidden;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </Box>
  );
};

export default CategoriesDashboard;