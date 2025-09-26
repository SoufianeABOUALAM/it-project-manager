import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  Icon,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Divider,
  Image,
  Avatar,
  Badge,
  useColorModeValue,
  IconButton,
  Tooltip,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@chakra-ui/react';
import { 
  HamburgerIcon, 
} from '@chakra-ui/icons';
import { 
  MdDashboard, 
  MdPeople, 
  MdInventory, 
  MdCategory, 
  MdLogout,
  MdBusiness,
  MdAccountCircle
} from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BouyguesLogo from './BouyguesLogo';

// Global CSS animations for the top bar
const globalStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const Layout = ({ children }) => {
    const { user, logoutUser } = useAuth();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const location = useLocation();
    
    // Color mode values
    const sidebarBg = useColorModeValue('white', 'gray.800');
    const mainBg = useColorModeValue('#f8fafc', 'gray.900');
    const borderColor = useColorModeValue('#e2e8f0', 'gray.600');
    const textColor = useColorModeValue('#1a202c', 'white');
    const hoverBg = useColorModeValue('#f7fafc', 'gray.700');
    const activeBg = useColorModeValue('#FF6B35', 'brand.900');
    const activeColor = useColorModeValue('white', 'brand.400');
    const cardBg = useColorModeValue('white', 'gray.800');
    const shadowColor = useColorModeValue('rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)');

    const handleLogout = () => {
        logoutUser();
    };

    // Navigation items with proper hierarchy
    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: MdDashboard, adminOnly: true, tier: 1 },
        { path: '/admin/projects', label: 'All Projects', icon: MdBusiness, adminOnly: true, tier: 1 },
        { path: '/admin/users', label: 'Users', icon: MdPeople, adminOnly: true, tier: 1 },
        { path: '/admin/categories', label: 'Categories', icon: MdCategory, adminOnly: true, tier: 1 },
        { path: '/admin/materials', label: 'Materials', icon: MdInventory, adminOnly: true, tier: 1 },
        // Regular user navigation items
        { path: '/dashboard', label: 'Dashboard', icon: MdDashboard, adminOnly: false, tier: 1 },
        { path: '/projects', label: 'My Projects', icon: MdBusiness, adminOnly: false, tier: 1 },
    ];

    // Check if current path is active
    const isActive = (path) => {
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) return true;
        if (path !== '/admin' && path !== '/dashboard' && location.pathname.startsWith(path)) return true;
        return false;
    };

    // Get page title from current path
    const getPageTitle = () => {
        const currentItem = navItems.find(item => isActive(item.path));
        return currentItem ? currentItem.label : 'Dashboard';
    };

    return (
        <>
            <style>{globalStyles}</style>
        <Box minH="100vh" bg={mainBg}>
            <Flex>
                {/* Enhanced Sidebar */}
                <Box
                    w={{ base: '0', md: '280px' }}
                    minH="100vh"
                    bg={sidebarBg}
                    borderRight="1px"
                borderColor={borderColor}
                    position="fixed"
                    left={0}
                top={0}
                zIndex={1000}
                    display={{ base: 'none', md: 'block' }}
                    boxShadow="0 0 20px rgba(0,0,0,0.1)"
                >
                    {/* Logo Section with Gradient Background */}
                    <Box 
                        p={6} 
                        borderBottom="1px" 
                        borderColor={borderColor}
                        bg="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <BouyguesLogo size="lg" variant="default" showText={false} />
                    </Box>

                    {/* Navigation with Proper Hierarchy */}
                    <VStack spacing={2} p={5} align="stretch">
                        {user && navItems.map((item) => {
                            // Show admin items only to admin users, show regular items only to regular users
                            const isAdmin = user.is_admin || user.is_staff || user.role === 'admin' || user.role === 'super_admin';
                            if (item.adminOnly && !isAdmin) return null;
                            if (!item.adminOnly && isAdmin) return null;
                            
                            const isItemActive = isActive(item.path);
                            
                            return (
                                <Box key={item.path} ml={item.tier === 2 ? 6 : 0}>
                                        <Button
                                            as={Link}
                                        to={item.path}
                                            variant="ghost"
                                        justifyContent="flex-start"
                                        h="48px"
                                        px={5}
                                        bg={isItemActive ? activeBg : 'transparent'}
                                        color={isItemActive ? activeColor : textColor}
                                        _hover={{
                                            bg: isItemActive ? activeBg : hoverBg,
                                            transform: 'translateX(6px)',
                                            boxShadow: isItemActive ? '0 4px 12px rgba(255, 107, 53, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                                        }}
                                        _active={{
                                            bg: activeBg,
                                        }}
                                        leftIcon={
                                            <Icon 
                                                as={item.icon} 
                                                w="20px" 
                                                h="20px" 
                                                color={isItemActive ? 'white' : '#64748b'}
                                            />
                                        }
                                        fontWeight={isItemActive ? 'bold' : 'semibold'}
                                        borderRadius="xl"
                                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                        fontSize="sm"
                                        position="relative"
                                        _before={isItemActive ? {
                                            content: '""',
                                            position: 'absolute',
                                            left: '-20px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            w: '4px',
                                            h: '24px',
                                            bg: '#FF6B35',
                                            borderRadius: '2px'
                                        } : {}}
                                    >
                                        {item.label}
                                    </Button>
                                </Box>
                            );
                        })}
                    </VStack>

                    {/* Enhanced User Section */}
                    {user && (
                        <Box 
                            position="absolute" 
                            bottom={0} 
                            left={0} 
                            right={0} 
                            p={5} 
                            borderTop="1px" 
                            borderColor={borderColor}
                            bg="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
                        >
                            <VStack spacing={4}>
                                <HStack spacing={4} w="full">
                                    <Avatar
                                        size="md"
                                        name={user.username}
                                        bg="#FF6B35"
                                        color="white"
                                        fontWeight="bold"
                                        boxShadow="0 4px 12px rgba(255, 107, 53, 0.3)"
                                    />
                                    <VStack align="start" spacing={1} flex={1}>
                                        <Text fontSize="md" fontWeight="bold" color={textColor}>
                                            {user.username}
                                        </Text>
                                        <Badge
                                            colorScheme={user.is_admin ? 'green' : 'blue'}
                                            size="sm"
                                            borderRadius="full"
                                            px={3}
                                            py={1}
                                            fontSize="xs"
                                        >
                                            {user.is_admin ? 'ADMIN' : 'USER'}
                                        </Badge>
                                    </VStack>
                                </HStack>
                                    <Button
                                        onClick={handleLogout}
                                        variant="outline"
                                    colorScheme="red"
                                    size="md"
                                    w="full"
                                    leftIcon={<Icon as={MdLogout} />}
                                    borderRadius="xl"
                                    fontWeight="semibold"
                                    fontSize="sm"
                                    _hover={{
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                    }}
                                    transition="all 0.2s ease"
                                    >
                                        Logout
                                    </Button>
                            </VStack>
                        </Box>
                    )}
                </Box>

                {/* Enhanced Main Content Area */}
                <Box
                    flex={1}
                    ml={{ base: 0, md: '280px' }}
                    minH="100vh"
                >
                    {/* Ultra-Creative Top Header */}
                    <Box
                        bg="rgba(255, 255, 255, 0.95)"
                        borderBottom="1px solid"
                        borderColor="rgba(255, 255, 255, 0.2)"
                        px={8}
                        py={6}
                        position="sticky"
                        top={0}
                        zIndex={100}
                        boxShadow="0 8px 32px rgba(0,0,0,0.12)"
                        backdropFilter="blur(20px)"
                        overflow="hidden"
                    >
                        {/* Bouygues Brand Animated Background Elements */}
                        <Box
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            bottom="0"
                            bgGradient="linear(to-r, rgba(255, 107, 53, 0.08) 0%, rgba(32, 178, 170, 0.08) 100%)"
                            opacity="0.4"
                        />
                        <Box
                            position="absolute"
                            top="-20px"
                            right="-20px"
                            w="100px"
                            h="100px"
                            borderRadius="full"
                            bgGradient="linear(to-br, #FF6B35 0%, #20B2AA 100%)"
                            opacity="0.15"
                            animation="float 8s ease-in-out infinite"
                        />
                        <Box
                            position="absolute"
                            bottom="-15px"
                            left="-15px"
                            w="60px"
                            h="60px"
                            borderRadius="full"
                            bgGradient="linear(to-br, #20B2AA 0%, #FF6B35 100%)"
                            opacity="0.15"
                            animation="float 6s ease-in-out infinite reverse"
                        />
                        <Box
                            position="absolute"
                            top="50%"
                            left="30%"
                            w="40px"
                            h="40px"
                            borderRadius="full"
                            bg="#FF6B35"
                            opacity="0.1"
                            animation="float 10s ease-in-out infinite"
                        />
                        <Flex justify="space-between" align="center" position="relative" zIndex="2">
                            <HStack spacing={6}>
                        {/* Mobile Menu Button */}
                                <IconButton
                            display={{ base: 'flex', md: 'none' }}
                            onClick={onOpen}
                            variant="ghost"
                            aria-label="Open menu"
                                    icon={<HamburgerIcon />}
                                    size="lg"
                                    borderRadius="xl"
                                />
                                
                                {/* Enhanced Page Title with Breadcrumb */}
                                <VStack align="start" spacing={2}>
                                    <HStack spacing={3} align="center">
                                        <Box
                                            p={2}
                                            borderRadius="xl"
                                            bgGradient="linear(to-br, #FF6B35 0%, #20B2AA 100%)"
                                            boxShadow="0 4px 15px rgba(255, 107, 53, 0.3)"
                                            _hover={{
                                                transform: 'scale(1.05) rotate(5deg)',
                                                boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)',
                                            }}
                                            transition="all 0.3s ease"
                                        >
                                            <Text fontSize="lg" color="white" fontWeight="bold">
                                                {getPageTitle().charAt(0)}
                                            </Text>
                                        </Box>
                                        <Text 
                                            fontSize="3xl" 
                                            fontWeight="black" 
                                            color={textColor}
                                            bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
                                            bgClip="text"
                                            letterSpacing="-0.02em"
                                        >
                                        {getPageTitle()}
                                    </Text>
                                    </HStack>
                                    
                                    <Box
                                        p={3}
                                        borderRadius="xl"
                                        bg="rgba(255, 255, 255, 0.8)"
                                        border="1px solid"
                                        borderColor="rgba(255, 255, 255, 0.3)"
                                        backdropFilter="blur(10px)"
                                    >
                                        <Breadcrumb fontSize="sm" color="gray.600" fontWeight="medium">
                                        <BreadcrumbItem>
                                                <BreadcrumbLink 
                                                    as={Link} 
                                                    to="/admin"
                                                    _hover={{ 
                                                        color: '#FF6B35',
                                                        textDecoration: 'none',
                                                        transform: 'translateX(2px)'
                                                    }}
                                                    transition="all 0.2s ease"
                                                >
                                                    🏠 Home
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                            <Box color="gray.400" mx={2}>/</Box>
                                        <BreadcrumbItem isCurrentPage>
                                                <Text 
                                                    color="gray.700" 
                                                    fontWeight="semibold"
                                                    bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
                                                    bgClip="text"
                                                >
                                                    {getPageTitle()}
                                                </Text>
                                        </BreadcrumbItem>
                                    </Breadcrumb>
                                    </Box>
                                </VStack>
                            </HStack>

                            {/* Ultra-Creative Action Bar */}
                            <HStack spacing={3}>
                                {user ? (
                                    <>
                                        {/* Enhanced User Profile */}
                                        <Tooltip label="Profile" placement="bottom" hasArrow>
                                            <IconButton
                                                variant="ghost"
                                                aria-label="Profile"
                                                icon={<MdAccountCircle />}
                                                color="gray.600"
                                                size="lg"
                                                borderRadius="xl"
                                                bg="rgba(255, 255, 255, 0.8)"
                                                border="1px solid"
                                                borderColor="rgba(255, 255, 255, 0.3)"
                                                _hover={{ 
                                                    bg: 'rgba(32, 178, 170, 0.1)',
                                                    borderColor: '#20B2AA',
                                                    transform: 'scale(1.05)',
                                                    boxShadow: '0 4px 15px rgba(32, 178, 170, 0.2)'
                                                }}
                                                transition="all 0.3s ease"
                                            />
                                        </Tooltip>
                                    </>
                                ) : (
                                    <HStack spacing={3}>
                                        <Button 
                                            as={Link} 
                                            to="/login" 
                                            variant="ghost" 
                                            size="md" 
                                            borderRadius="xl"
                                            bg="rgba(255, 255, 255, 0.8)"
                                            border="1px solid"
                                            borderColor="rgba(255, 255, 255, 0.3)"
                                            _hover={{ 
                                                bg: 'rgba(255, 107, 53, 0.1)',
                                                borderColor: '#FF6B35',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 15px rgba(255, 107, 53, 0.2)'
                                            }}
                                            transition="all 0.3s ease"
                                        >
                                            Login
                                        </Button>
                                        <Button 
                                            as={Link} 
                                            to="/register" 
                                            variant="solid" 
                                            bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
                                            color="white" 
                                            size="md" 
                                            borderRadius="xl" 
                                            _hover={{ 
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)'
                                            }}
                                            transition="all 0.3s ease"
                                        >
                                            Register
                        </Button>
                                    </HStack>
                                )}
                            </HStack>
                    </Flex>
            </Box>

                    {/* Page Content with Enhanced Padding */}
                    <Box p={8}>
                        {children}
                    </Box>
                </Box>
            </Flex>

            {/* Enhanced Mobile Drawer */}
            <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
                <DrawerOverlay bg="rgba(0,0,0,0.4)" backdropFilter="blur(4px)" />
                <DrawerContent>
                    <DrawerCloseButton size="lg" borderRadius="xl" />
                    <DrawerHeader 
                        borderBottom="1px" 
                        borderColor={borderColor}
                        bg="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
                        p={6}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <BouyguesLogo size="lg" variant="default" showText={false} />
                    </DrawerHeader>
                    <DrawerBody p={6}>
                        <VStack spacing={2} align="stretch">
                            {user && navItems.map((item) => {
                                // Show admin items only to admin users, show regular items only to regular users
                                const isAdmin = user.is_admin || user.is_staff || user.role === 'admin' || user.role === 'super_admin';
                                if (item.adminOnly && !isAdmin) return null;
                                if (!item.adminOnly && isAdmin) return null;
                                
                                const isItemActive = isActive(item.path);
                                
                                return (
                                    <Box key={item.path} ml={item.tier === 2 ? 6 : 0}>
                                        <Button
                                            as={Link}
                                            to={item.path}
                                            variant="ghost"
                                            justifyContent="flex-start"
                                            h="48px"
                                            px={5}
                                            bg={isItemActive ? activeBg : 'transparent'}
                                            color={isItemActive ? activeColor : textColor}
                                            _hover={{
                                                bg: isItemActive ? activeBg : hoverBg,
                                                transform: 'translateX(6px)',
                                            }}
                                            leftIcon={
                                                <Icon 
                                                    as={item.icon} 
                                                    w="20px" 
                                                    h="20px" 
                                                    color={isItemActive ? 'white' : '#64748b'}
                                                />
                                            }
                                            fontWeight={isItemActive ? 'bold' : 'semibold'}
                                            borderRadius="xl"
                                            fontSize="sm"
                                            onClick={onClose}
                                            transition="all 0.3s ease"
                                        >
                                            {item.label}
                                        </Button>
                                    </Box>
                                );
                            })}
                            
                            {user && (
                                <>
                                    <Divider my={6} />
                                    <HStack spacing={4}>
                                        <Avatar
                                            size="md"
                                            name={user.username}
                                            bg="#FF6B35"
                                            color="white"
                                            fontWeight="bold"
                                        />
                                        <VStack align="start" spacing={1} flex={1}>
                                            <Text fontSize="md" fontWeight="bold" color={textColor}>
                                                {user.username}
                                            </Text>
                                            <Badge
                                                colorScheme={user.is_admin ? 'green' : 'blue'}
                                                size="sm"
                                                borderRadius="full"
                                                px={3}
                                                py={1}
                                                fontSize="xs"
                                            >
                                                {user.is_admin ? 'ADMIN' : 'USER'}
                                            </Badge>
                                        </VStack>
                                    </HStack>
                                    <Button
                                        onClick={() => {
                                            handleLogout();
                                            onClose();
                                        }}
                                        variant="outline"
                                        colorScheme="red"
                                        size="md"
                                        leftIcon={<Icon as={MdLogout} />}
                                        mt={4}
                                        borderRadius="xl"
                                        fontWeight="semibold"
                                        fontSize="sm"
                                    >
                                        Logout
                                    </Button>
                                </>
                            )}
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
        </>
    );
};

export default Layout;
