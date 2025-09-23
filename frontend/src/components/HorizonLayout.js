import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import BouyguesLogo from './BouyguesLogo';
import { HamburgerIcon } from '@chakra-ui/icons';
import {
  MdDashboard,
  MdPeople,
  MdBusiness,
  MdInventory,
  MdCategory,
  MdSettings,
  MdSearch,
  MdNotifications,
  MdInfo,
  MdDarkMode,
  MdLightMode,
  MdRefresh,
  MdTimer,
} from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';

const HorizonLayout = ({ children, currentView = 'dashboard', onViewChange, onRefresh, lastUpdated, autoRefresh, setAutoRefresh }) => {
  const { user, refreshUser } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const [sidebarCollapsed] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Color mode values
  const sidebarBg = useColorModeValue('white', 'black.800');
  const mainBg = useColorModeValue('secondaryGray.100', 'black.900');
  const textColor = useColorModeValue('black.900', 'white');
  const borderColor = useColorModeValue('secondaryGray.200', 'black.700');
  const hoverBg = useColorModeValue('orange.50', 'blackGreen.800');


  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: MdDashboard },
    { id: 'projects', label: 'My Projects', icon: MdBusiness },
    { id: 'users', label: 'Users', icon: MdPeople },
    { id: 'categories', label: 'Categories', icon: MdCategory },
    { id: 'materials', label: 'Materials', icon: MdInventory },
    { id: 'settings', label: 'Settings', icon: MdSettings },
  ];

  const handleNavigation = (itemId) => {
    if (onViewChange) {
      onViewChange(itemId);
    }
    if (isOpen) {
      onClose();
    }
  };

  const SidebarContent = ({ isMobile = false }) => (
    <VStack
      h="full"
      w={isMobile ? '280px' : sidebarCollapsed ? '80px' : '280px'}
      bg={sidebarBg}
      borderRight="1px"
      borderColor={borderColor}
      spacing={0}
      align="stretch"
    >
      {/* Brand Section */}
      <Box p={4} borderBottom="1px" borderColor={borderColor}>
        <Flex justify="center" align="center">
          {sidebarCollapsed ? (
            <Box
              w="80px"
              h="80px"
              bg="linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 4px 12px rgba(255, 107, 53, 0.3)"
            >
              <Text color="white" fontWeight="bold" fontSize="2xl">
                B
              </Text>
            </Box>
          ) : (
            <BouyguesLogo size="md" showText={false} />
          )}
        </Flex>
        {!sidebarCollapsed && (
          <Box mt={3} textAlign="center">
            <Text fontSize="xs" color="secondaryGray.500" fontWeight="medium">
              Project Management System
            </Text>
          </Box>
        )}
      </Box>

             {/* Navigation */}
       <VStack spacing={2} p={4} flex={1} align="stretch">
         {navigationItems.map((item) => (
           <Button
             key={item.id}
             variant="ghost"
             size="lg"
             justifyContent={sidebarCollapsed ? 'center' : 'flex-start'}
             leftIcon={!sidebarCollapsed ? <Icon as={item.icon} /> : undefined}
             icon={sidebarCollapsed ? <Icon as={item.icon} /> : undefined}
             color={textColor}
             bg={currentView === item.id ? 'orange.100' : 'transparent'}
             _hover={{ bg: hoverBg }}
             _active={{ bg: 'orange.200' }}
             onClick={() => handleNavigation(item.id)}
           >
             {!sidebarCollapsed && item.label}
           </Button>
         ))}
       </VStack>

      {/* Upgrade Section */}
      <Box p={4}>
        <Box
          bg="orange.500"
          borderRadius="xl"
          p={4}
          textAlign="center"
          color="white"
        >
          <VStack spacing={2}>
            <Box
              w="40px"
              h="40px"
              bg="white"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
            >
              <Text color="orange.500" fontWeight="bold" fontSize="lg">
                ⭐
              </Text>
            </Box>
            {!sidebarCollapsed && (
              <>
                <Text fontWeight="bold" fontSize="sm">
                  Upgrade to PRO
                </Text>
                <Text fontSize="xs" opacity={0.9}>
                  Improve your development process
                </Text>
              </>
            )}
          </VStack>
        </Box>
      </Box>
    </VStack>
  );

  return (
    <Box minH="100vh" bg={mainBg}>
      <Flex>
        {/* Desktop Sidebar */}
        <Box
          display={{ base: 'none', lg: 'block' }}
          position="fixed"
          left={0}
          top={0}
          h="100vh"
          zIndex={1000}
        >
          <SidebarContent />
        </Box>

        {/* Main Content */}
        <Box
          flex={1}
          ml={{ base: 0, lg: sidebarCollapsed ? '80px' : '280px' }}
          transition="margin-left 0.3s ease"
        >
          {/* Header */}
          <Box
            bg={sidebarBg}
            borderBottom="1px"
            borderColor={borderColor}
            position="sticky"
            top={0}
            zIndex={999}
            boxShadow="sm"
          >
            <Flex h="70px" align="center" justify="space-between" px={6}>
              {/* Left side - Mobile menu and breadcrumbs */}
              <HStack spacing={4}>
                <Button
                  display={{ base: 'flex', lg: 'none' }}
                  onClick={onOpen}
                  variant="ghost"
                  size="sm"
                >
                  <HamburgerIcon />
                </Button>
                <VStack spacing={0} align="start">
                  <Text fontSize="sm" color="secondaryGray.500">
                    Pages / {navigationItems.find(item => item.id === currentView)?.label || 'Main Dashboard'}
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color={textColor}>
                    {navigationItems.find(item => item.id === currentView)?.label || 'Main Dashboard'}
                  </Text>
                </VStack>
              </HStack>

              {/* Right side - Search and user controls */}
              <HStack spacing={4}>
                {/* Search */}
                <Box position="relative" display={{ base: 'none', md: 'block' }}>
                  <Icon
                    as={MdSearch}
                    position="absolute"
                    left={3}
                    top="50%"
                    transform="translateY(-50%)"
                    color="secondaryGray.500"
                    w={4}
                    h={4}
                  />
                  <Box
                    as="input"
                    placeholder="Search..."
                    bg="secondaryGray.100"
                    border="1px"
                    borderColor="secondaryGray.200"
                    borderRadius="lg"
                    pl={10}
                    pr={4}
                    py={2}
                    w="200px"
                    fontSize="sm"
                    _focus={{
                      outline: 'none',
                      borderColor: 'orange.500',
                      boxShadow: '0 0 0 1px orange.500',
                    }}
                  />
                </Box>

                {/* Icons */}
                <HStack spacing={2}>
                  {onRefresh && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      p={2}
                      onClick={onRefresh}
                      title="Refresh Dashboard"
                    >
                      <Icon as={MdRefresh} w={5} h={5} color={textColor} />
                    </Button>
                  )}
                  {setAutoRefresh && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      p={2}
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      title={autoRefresh ? "Disable Auto Refresh" : "Enable Auto Refresh"}
                      colorScheme={autoRefresh ? "green" : "gray"}
                    >
                      <Icon as={MdTimer} w={5} h={5} color={autoRefresh ? "green.500" : textColor} />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" p={2}>
                    <Icon as={MdNotifications} w={5} h={5} color={textColor} />
                  </Button>
                  <Button variant="ghost" size="sm" p={2}>
                    <Icon as={MdInfo} w={5} h={5} color={textColor} />
                  </Button>
                  <Button variant="ghost" size="sm" p={2} onClick={toggleColorMode}>
                    <Icon
                      as={colorMode === 'light' ? MdDarkMode : MdLightMode}
                      w={5}
                      h={5}
                      color={textColor}
                    />
                  </Button>
                </HStack>

                {/* User Profile */}
                <HStack spacing={3}>
                  <Box
                    w="40px"
                    h="40px"
                    bg="orange.500"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="white" fontWeight="bold">
                      {user?.username?.charAt(0).toUpperCase() || 'A'}
                    </Text>
                  </Box>
                  <VStack spacing={0} align="start" display={{ base: 'none', md: 'flex' }}>
                    <Text fontSize="sm" fontWeight="medium" color={textColor}>
                      {user?.username || 'Admin'}
                    </Text>
                    <Text fontSize="xs" color="secondaryGray.500">
                      {user?.role_display || 'Administrator'}
                    </Text>
                    {lastUpdated && (
                      <Text fontSize="xs" color="secondaryGray.400">
                        Updated: {lastUpdated}
                      </Text>
                    )}
                  </VStack>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    p={2}
                    onClick={refreshUser}
                    title="Refresh User Data"
                  >
                    <Icon as={MdRefresh} w={4} h={4} color={textColor} />
                  </Button>
                </HStack>
              </HStack>
            </Flex>
          </Box>

          {/* Page Content */}
          <Box p={6}>
            {children}
          </Box>
        </Box>
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody p={0}>
            <SidebarContent isMobile={true} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default HorizonLayout;
