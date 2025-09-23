import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Container,
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
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { MdAdminPanelSettings } from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';

const ChakraLayout = ({ children }) => {
  const { user, logoutUser } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bg = 'white';
  const color = 'gray.800';
  const borderColor = 'gray.200';

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box
        bg={bg}
        borderBottom="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={1000}
        boxShadow="sm"
      >
        <Container maxW="container.xl">
          <Flex h="70px" align="center" justify="space-between">
            {/* Logo */}
            <HStack spacing={3}>
              <Icon as={MdAdminPanelSettings} w="32px" h="32px" color="brand.500" />
              <Text fontSize="xl" fontWeight="bold" color={color}>
                IT Project Manager
              </Text>
            </HStack>

            {/* Desktop Navigation */}
            <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
              {user ? (
                <>
                  <Text color={color}>Welcome, {user.username}</Text>
                  {user.is_admin && (
                    <Button
                      as="a"
                      href="/admin"
                      variant="ghost"
                      colorScheme="brand"
                      size="sm"
                    >
                      Admin Dashboard
                    </Button>
                  )}
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    colorScheme="red"
                    size="sm"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button as="a" href="/login" variant="ghost" colorScheme="brand">
                    Login
                  </Button>
                  <Button as="a" href="/register" variant="solid" colorScheme="brand">
                    Register
                  </Button>
                </>
              )}
            </HStack>

            {/* Mobile Menu Button */}
            <Button
              display={{ base: 'flex', md: 'none' }}
              onClick={onOpen}
              variant="ghost"
              aria-label="Open menu"
            >
              <HamburgerIcon />
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {user ? (
                <>
                  <Text>Welcome, {user.username}</Text>
                  {user.is_admin && (
                    <Button
                      as="a"
                      href="/admin"
                      variant="ghost"
                      colorScheme="brand"
                      onClick={onClose}
                    >
                      Admin Dashboard
                    </Button>
                  )}
                  <Divider />
                  <Button
                    onClick={() => {
                      handleLogout();
                      onClose();
                    }}
                    variant="outline"
                    colorScheme="red"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button as="a" href="/login" variant="ghost" colorScheme="brand" onClick={onClose}>
                    Login
                  </Button>
                  <Button as="a" href="/register" variant="solid" colorScheme="brand" onClick={onClose}>
                    Register
                  </Button>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box>
        {children}
      </Box>
    </Box>
  );
};

export default ChakraLayout;
