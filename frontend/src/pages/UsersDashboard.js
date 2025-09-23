import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Text,
  Icon,
  Button,
  Container,
  VStack,
  HStack,
  Badge,
  Heading,
  Spinner,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  useToast,
  Grid,
} from '@chakra-ui/react';
import {
  MdPeople,
  MdEdit,
  MdDelete,
  MdPerson,
  MdEmail,
  MdAdminPanelSettings,
  MdSecurity,
  MdRefresh,
  MdSearch,
  MdTrendingUp,
  MdTrendingDown,
  MdDateRange,
  MdGroup,
  MdPersonAdd,
  MdError,
} from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

const UsersDashboard = () => {
  const { authToken, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_joined');
  const [sortOrder, setSortOrder] = useState('desc');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'user'
  });

  // Modal controls
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const toast = useToast();


  useEffect(() => {
    if (user && user.is_admin) {
      fetchUsers();
    } else {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
    }
  }, [user, fetchUsers]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}auth/users/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      setUsers(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users data');
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  const handleCreateUser = async () => {
    // Validate password confirmation
    if (formData.password !== formData.password2) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const response = await axios.post(`${API_URL}auth/users/create/`, formData, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      toast({
        title: "User created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      
      setFormData({ username: '', email: '', password: '', password2: '', role: 'user' });
      onCreateClose();
      fetchUsers();
    } catch (error) {
      toast({
        title: "Failed to create user",
        description: error.response?.data?.detail || "Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleEditUser = async () => {
    // Validate password confirmation if password is provided
    if (formData.password && formData.password !== formData.password2) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password; // Don't send empty password
        delete updateData.password2; // Don't send empty password2
      } else {
        delete updateData.password2; // Remove password2 from API call
      }
      
      await axios.put(`${API_URL}auth/users/${editingUser.id}/`, updateData, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      toast({
        title: "User updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      
      setFormData({ username: '', email: '', password: '', password2: '', role: 'user' });
      setEditingUser(null);
      onEditClose();
      fetchUsers();
    } catch (error) {
      toast({
        title: "Failed to update user",
        description: error.response?.data?.detail || "Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${API_URL}auth/users/${editingUser.id}/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      toast({
        title: "User deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      
      setEditingUser(null);
      onDeleteClose();
      fetchUsers();
    } catch (error) {
      toast({
        title: "Failed to delete user",
        description: error.response?.data?.detail || "Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      password2: '',
      role: user.role || 'user'
    });
    onEditOpen();
  };

  const openDeleteModal = (user) => {
    setEditingUser(user);
    onDeleteOpen();
  };


  // Filter and sort users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'username':
        aValue = a.username.toLowerCase();
        bValue = b.username.toLowerCase();
        break;
      case 'email':
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
        break;
      case 'role':
        aValue = a.role;
        bValue = b.role;
        break;
      case 'date_joined':
        aValue = new Date(a.date_joined);
        bValue = new Date(b.date_joined);
        break;
      default:
        aValue = a.username.toLowerCase();
        bValue = b.username.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Get user statistics
  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
    regular: users.filter(u => u.role === 'user').length,
    superAdmins: users.filter(u => u.role === 'super_admin').length
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
                Loading Users
              </Text>
              <Text color="white" opacity="0.8" fontSize="lg">
                Preparing your user management dashboard...
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
      <Box minH="100vh" bgGradient="linear(to-br, #ff6b6b 0%, #ee5a24 100%)" position="relative">
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
        {/* Search and Filter Controls */}
        <Box
          p={6}
          bg="white"
          borderRadius="2xl"
          boxShadow="0 8px 32px rgba(0,0,0,0.08)"
          border="1px solid"
          borderColor="gray.100"
          mb={8}
        >
          <HStack spacing={4} align="center">
            <Box flex={1}>
            <HStack spacing={3}>
                <Icon as={MdSearch} w="20px" h="20px" color="gray.500" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  border="none"
                  bg="gray.50"
                  borderRadius="xl"
                  _focus={{ bg: "white", boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)" }}
                />
              </HStack>
            </Box>
            
            <HStack spacing={3}>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                border="none"
                bg="gray.50"
                borderRadius="xl"
                w="150px"
                _focus={{ bg: "white", boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)" }}
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
                <option value="super_admin">Super Admins</option>
              </Select>
              
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                border="none"
                bg="gray.50"
                borderRadius="xl"
                w="150px"
                _focus={{ bg: "white", boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)" }}
              >
                <option value="date_joined">Join Date</option>
                <option value="username">Username</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
              </Select>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                borderRadius="xl"
                _hover={{ bg: "gray.100" }}
              >
                <Icon as={sortOrder === 'asc' ? MdTrendingUp : MdTrendingDown} w="16px" h="16px" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={fetchUsers}
                borderRadius="xl"
                _hover={{ bg: "gray.100" }}
              >
                <Icon as={MdRefresh} w="16px" h="16px" />
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Action Bar with Add User Button */}
        <Box mb={8} display="flex" justifyContent="flex-end">
          <Button
            leftIcon={<Icon as={MdPersonAdd} />}
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
            onClick={onCreateOpen}
          >
            Add New User
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6} mb={8}>
          <Box
            p={6}
            bg="white"
            borderRadius="2xl"
            boxShadow="0 8px 32px rgba(0,0,0,0.08)"
            border="1px solid"
            borderColor="gray.100"
            position="relative"
            overflow="hidden"
            _hover={{
              transform: 'translateY(-4px)',
              boxShadow: '0 15px 45px rgba(0,0,0,0.15)',
            }}
            transition="all 0.3s ease"
          >
            <Box position="absolute" top="0" left="0" right="0" h="4px" bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)" />
            <VStack spacing={3} align="start">
              <HStack spacing={3}>
                <Box p={3} borderRadius="xl" bg="rgba(255, 107, 53, 0.1)">
                  <Icon as={MdGroup} w="24px" h="24px" color="#FF6B35" />
                </Box>
                <Text fontSize="sm" color="gray.600" fontWeight="semibold">Total Users</Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="black" color="gray.800">{userStats.total}</Text>
              <Text fontSize="xs" color="gray.500">All registered users</Text>
            </VStack>
          </Box>

          <Box
            p={6}
            bg="white"
            borderRadius="2xl"
            boxShadow="0 8px 32px rgba(0,0,0,0.08)"
            border="1px solid"
            borderColor="gray.100"
            position="relative"
            overflow="hidden"
            _hover={{
              transform: 'translateY(-4px)',
              boxShadow: '0 15px 45px rgba(0,0,0,0.15)',
            }}
            transition="all 0.3s ease"
          >
            <Box position="absolute" top="0" left="0" right="0" h="4px" bgGradient="linear(to-r, #20B2AA 0%, #40e0d0 100%)" />
            <VStack spacing={3} align="start">
              <HStack spacing={3}>
                <Box p={3} borderRadius="xl" bg="rgba(32, 178, 170, 0.1)">
                  <Icon as={MdAdminPanelSettings} w="24px" h="24px" color="#20B2AA" />
                </Box>
                <Text fontSize="sm" color="gray.600" fontWeight="semibold">Admins</Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="black" color="gray.800">{userStats.admins}</Text>
              <Text fontSize="xs" color="gray.500">Admin & Super Admin</Text>
            </VStack>
          </Box>

          <Box
            p={6}
            bg="white"
            borderRadius="2xl"
            boxShadow="0 8px 32px rgba(0,0,0,0.08)"
            border="1px solid"
            borderColor="gray.100"
            position="relative"
            overflow="hidden"
            _hover={{
              transform: 'translateY(-4px)',
              boxShadow: '0 15px 45px rgba(0,0,0,0.15)',
            }}
            transition="all 0.3s ease"
          >
            <Box position="absolute" top="0" left="0" right="0" h="4px" bgGradient="linear(to-r, #FF6B35 0%, #e55a2b 100%)" />
            <VStack spacing={3} align="start">
              <HStack spacing={3}>
                <Box p={3} borderRadius="xl" bg="rgba(255, 107, 53, 0.1)">
                  <Icon as={MdPerson} w="24px" h="24px" color="#FF6B35" />
                </Box>
                <Text fontSize="sm" color="gray.600" fontWeight="semibold">Regular Users</Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="black" color="gray.800">{userStats.regular}</Text>
              <Text fontSize="xs" color="gray.500">Standard users</Text>
            </VStack>
          </Box>

          <Box
            p={6}
            bg="white"
            borderRadius="2xl"
            boxShadow="0 8px 32px rgba(0,0,0,0.08)"
            border="1px solid"
            borderColor="gray.100"
            position="relative"
            overflow="hidden"
            _hover={{
              transform: 'translateY(-4px)',
              boxShadow: '0 15px 45px rgba(0,0,0,0.15)',
            }}
            transition="all 0.3s ease"
          >
            <Box position="absolute" top="0" left="0" right="0" h="4px" bgGradient="linear(to-r, #20B2AA 0%, #17a2b8 100%)" />
            <VStack spacing={3} align="start">
              <HStack spacing={3}>
                <Box p={3} borderRadius="xl" bg="rgba(32, 178, 170, 0.1)">
                  <Icon as={MdSecurity} w="24px" h="24px" color="#20B2AA" />
                </Box>
                <Text fontSize="sm" color="gray.600" fontWeight="semibold">Super Admins</Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="black" color="gray.800">{userStats.superAdmins}</Text>
              <Text fontSize="xs" color="gray.500">Highest privileges</Text>
            </VStack>
          </Box>
        </Grid>

        {/* Modern User Cards Display */}
        <Box
          p={6}
          bg="white"
          borderRadius="2xl"
          boxShadow="0 8px 32px rgba(0,0,0,0.08)"
          border="1px solid"
          borderColor="gray.100"
        >
          <HStack justify="space-between" align="center" mb={6}>
            <VStack align="start" spacing={1}>
              <Heading size="lg" color="gray.800" fontWeight="bold">
                Users ({filteredUsers.length})
              </Heading>
              <Text color="gray.500" fontSize="sm">
                Manage and organize your team members
              </Text>
            </VStack>
            </HStack>

          {filteredUsers.length === 0 ? (
            <Center py={16}>
              <VStack spacing={4}>
                <Box p={6} borderRadius="full" bg="gray.100">
                  <Icon as={MdPeople} w="48px" h="48px" color="gray.400" />
                </Box>
                <VStack spacing={2}>
                  <Text fontSize="lg" color="gray.600" fontWeight="medium">
                    No users found
                  </Text>
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    {searchTerm || roleFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Get started by adding your first user'
                    }
            </Text>
          </VStack>
                {(!searchTerm && roleFilter === 'all') && (
          <Button
                    leftIcon={<Icon as={MdPersonAdd} />}
                    colorScheme="blue"
            onClick={onCreateOpen}
                    borderRadius="xl"
          >
                    Add First User
          </Button>
                )}
              </VStack>
            </Center>
          ) : (
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
              {filteredUsers.map((user) => (
                <Box
                  key={user.id}
                  p={6}
                  bg="white"
                  borderRadius="2xl"
                  border="2px solid"
                  borderColor="gray.100"
                  position="relative"
                  overflow="hidden"
                  _hover={{
                    borderColor: user.role === 'super_admin' ? 'orange.300' : 
                                user.role === 'admin' ? 'purple.300' : 'blue.300',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 15px 45px rgba(0,0,0,0.1)',
                  }}
                  transition="all 0.3s ease"
                >
                  {/* Role Indicator */}
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    h="4px"
                    bgGradient={
                      user.role === 'super_admin' ? 'linear(to-r, #ffecd2 0%, #fcb69f 100%)' :
                      user.role === 'admin' ? 'linear(to-r, #f093fb 0%, #f5576c 100%)' :
                      'linear(to-r, #667eea 0%, #764ba2 100%)'
                    }
                  />
                  
                  <VStack spacing={4} align="start">
                    {/* User Avatar and Info */}
                    <HStack spacing={4} align="start" w="full">
                      <Box
                        p={3}
                        borderRadius="xl"
                        bg={
                          user.role === 'super_admin' ? 'rgba(32, 178, 170, 0.1)' :
                          user.role === 'admin' ? 'rgba(32, 178, 170, 0.1)' : 'rgba(255, 107, 53, 0.1)'
                        }
                        position="relative"
                      >
                        <Icon 
                          as={user.role === 'super_admin' ? MdSecurity : 
                              user.role === 'admin' ? MdAdminPanelSettings : MdPerson} 
                          w="24px" h="24px" 
                          color={
                            user.role === 'super_admin' ? '#20B2AA' :
                            user.role === 'admin' ? '#20B2AA' : '#FF6B35'
                          } 
                        />
                        {user.role === 'super_admin' && (
                          <Box position="absolute" top="-2px" right="-2px" w="12px" h="12px" borderRadius="full" bg="#20B2AA" border="2px solid white" />
                        )}
                      </Box>
                      
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontSize="lg" fontWeight="bold" color="gray.800" noOfLines={1}>
                          {user.username}
                        </Text>
                        <Text fontSize="sm" color="gray.600" noOfLines={1}>
                          {user.email}
                        </Text>
                        <Badge
                          size="sm"
                          colorScheme={
                            user.role === 'super_admin' ? 'orange' :
                            user.role === 'admin' ? 'purple' : 'blue'
                          }
                          borderRadius="full"
                          px={3}
                          py={1}
                        >
                          {user.role_display || user.role}
                        </Badge>
                      </VStack>
                    </HStack>

                    {/* Join Date */}
                    <HStack spacing={2} color="gray.500">
                      <Icon as={MdDateRange} w="16px" h="16px" />
                      <Text fontSize="sm">
                        Joined {new Date(user.date_joined).toLocaleDateString()}
                      </Text>
                    </HStack>

                    {/* Actions */}
                    <HStack spacing={2} w="full" justify="end">
                      <Button
                            size="sm"
                            variant="ghost"
                        leftIcon={<Icon as={MdEdit} />}
                              onClick={() => openEditModal(user)}
                        borderRadius="xl"
                        _hover={{ bg: "blue.50", color: "blue.600" }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Icon as={MdDelete} />}
                              onClick={() => openDeleteModal(user)}
                        borderRadius="xl"
                        _hover={{ bg: "red.50", color: "red.600" }}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </Grid>
          )}
        </Box>

        {/* Ultra-Creative Create User Modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl" isCentered>
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
                  <Icon as={MdPersonAdd} w="32px" h="32px" color="white" />
                </Box>
                <VStack spacing={2} textAlign="center">
                  <Heading
                    size="xl"
                    bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
                    bgClip="text"
                    fontWeight="black"
                  >
                    Create New User
                  </Heading>
                  <Text color="gray.600" fontSize="lg" fontWeight="medium">
                    Add a new team member to your organization
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
                {/* Form Fields */}
                <Grid templateColumns="1fr 1fr" gap={6} w="full">
                <FormControl>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="bold"
                      color="gray.700"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Icon as={MdPerson} w="16px" h="16px" color="#FF6B35" />
                      Username
                    </FormLabel>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="Enter username"
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
                      fontWeight="medium"
                  />
                </FormControl>

                <FormControl>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="bold"
                      color="gray.700"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Icon as={MdEmail} w="16px" h="16px" color="#20B2AA" />
                      Email Address
                    </FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter email address"
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
                      fontWeight="medium"
                  />
                </FormControl>
                </Grid>

                <Grid templateColumns="1fr 1fr" gap={6} w="full">
                <FormControl>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="bold"
                      color="gray.700"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Icon as={MdSecurity} w="16px" h="16px" color="#FF6B35" />
                      Password
                    </FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter password"
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
                      fontWeight="medium"
                  />
                </FormControl>

                <FormControl>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="bold"
                      color="gray.700"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Icon as={MdSecurity} w="16px" h="16px" color="#20B2AA" />
                      Confirm Password
                    </FormLabel>
                  <Input
                    type="password"
                    value={formData.password2}
                    onChange={(e) => setFormData({...formData, password2: e.target.value})}
                    placeholder="Confirm password"
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
                      fontWeight="medium"
                  />
                </FormControl>
                </Grid>

                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="bold"
                    color="gray.700"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <Icon as={MdAdminPanelSettings} w="16px" h="16px" color="#FF6B35" />
                    User Role
                  </FormLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
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
                    fontWeight="medium"
                  >
                    <option value="user">👤 Regular User</option>
                    {user?.role === 'super_admin' && (
                      <>
                        <option value="admin">🛡️ Administrator</option>
                        <option value="super_admin">👑 Super Administrator</option>
                      </>
                    )}
                  </Select>
                  {user?.role === 'admin' && (
                    <Text fontSize="sm" color="orange.500" mt={1}>
                      ⚠️ Only Super Admins can create Admin accounts
                    </Text>
                  )}
                </FormControl>

                {/* Role Preview */}
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
                      🎯 Role Preview
                    </Text>
                    <HStack justify="center" spacing={2}>
                      <Icon 
                        as={formData.role === 'super_admin' ? MdSecurity : 
                            formData.role === 'admin' ? MdAdminPanelSettings : MdPerson} 
                        w="20px" h="20px" 
                        color={formData.role === 'super_admin' ? '#20B2AA' :
                               formData.role === 'admin' ? '#20B2AA' : '#FF6B35'} 
                      />
                      <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        {formData.role === 'super_admin' ? 'Super Administrator - Full system access' :
                         formData.role === 'admin' ? 'Administrator - Management privileges' : 
                         'Regular User - Standard access'}
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
                  onClick={onCreateClose}
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
                  leftIcon={<Icon as={MdPersonAdd} />}
                  onClick={handleCreateUser}
                >
                    Create User
                  </Button>
                </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Ultra-Creative Edit User Modal */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl" isCentered>
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
                  <Icon as={MdEdit} w="32px" h="32px" color="white" />
                </Box>
                <VStack spacing={2} textAlign="center">
                  <Heading
                    size="xl"
                    bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
                    bgClip="text"
                    fontWeight="black"
                  >
                    Edit User Profile
                  </Heading>
                  <Text color="gray.600" fontSize="lg" fontWeight="medium">
                    Update {editingUser?.username}'s information and permissions
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
                {/* Form Fields */}
                <Grid templateColumns="1fr 1fr" gap={6} w="full">
                <FormControl>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="bold"
                      color="gray.700"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Icon as={MdPerson} w="16px" h="16px" color="#FF6B35" />
                      Username
                    </FormLabel>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="Enter username"
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
                      fontWeight="medium"
                  />
                </FormControl>

                <FormControl>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="bold"
                      color="gray.700"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Icon as={MdEmail} w="16px" h="16px" color="#20B2AA" />
                      Email Address
                    </FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter email address"
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
                      fontWeight="medium"
                  />
                </FormControl>
                </Grid>

                <Grid templateColumns="1fr 1fr" gap={6} w="full">
                <FormControl>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="bold"
                      color="gray.700"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Icon as={MdSecurity} w="16px" h="16px" color="#FF6B35" />
                      New Password
                    </FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Enter new password (optional)"
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
                      fontWeight="medium"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      💡 Leave blank to keep current password
                    </Text>
                </FormControl>

                <FormControl>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="bold"
                      color="gray.700"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Icon as={MdSecurity} w="16px" h="16px" color="#20B2AA" />
                      Confirm New Password
                    </FormLabel>
                  <Input
                    type="password"
                    value={formData.password2}
                    onChange={(e) => setFormData({...formData, password2: e.target.value})}
                    placeholder="Confirm new password"
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
                      fontWeight="medium"
                  />
                </FormControl>
                </Grid>

                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="bold"
                    color="gray.700"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <Icon as={MdAdminPanelSettings} w="16px" h="16px" color="#FF6B35" />
                    User Role
                  </FormLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
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
                    fontWeight="medium"
                  >
                    <option value="user">👤 Regular User</option>
                    {user?.role === 'super_admin' && (
                      <>
                        <option value="admin">🛡️ Administrator</option>
                        <option value="super_admin">👑 Super Administrator</option>
                      </>
                    )}
                  </Select>
                  {user?.role === 'admin' && (
                    <Text fontSize="sm" color="orange.500" mt={1}>
                      ⚠️ Only Super Admins can create Admin accounts
                    </Text>
                  )}
                </FormControl>

                {/* Current User Info */}
                <Box
                  p={4}
                  bg="rgba(32, 178, 170, 0.05)"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="rgba(32, 178, 170, 0.1)"
                  w="full"
                >
                  <VStack spacing={2}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      📋 Current User Information
                    </Text>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="gray.500">
                        Current Role:
                      </Text>
                      <HStack spacing={2}>
                        <Icon 
                          as={editingUser?.role === 'super_admin' ? MdSecurity : 
                              editingUser?.role === 'admin' ? MdAdminPanelSettings : MdPerson} 
                          w="16px" h="16px" 
                          color={editingUser?.role === 'super_admin' ? '#20B2AA' :
                                 editingUser?.role === 'admin' ? '#20B2AA' : '#FF6B35'} 
                        />
                        <Text fontSize="sm" color="gray.700" fontWeight="medium">
                          {editingUser?.role === 'super_admin' ? 'Super Administrator' :
                           editingUser?.role === 'admin' ? 'Administrator' : 'Regular User'}
                        </Text>
                      </HStack>
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
                  onClick={onEditClose}
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
                  leftIcon={<Icon as={MdEdit} />}
                  onClick={handleEditUser}
                >
                    Update User
                  </Button>
                </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete User Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete User</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <Text>
                  Are you sure you want to delete user <strong>{editingUser?.username}</strong>?
                  This action cannot be undone.
                </Text>
                <HStack spacing={4} w="100%">
                  <Button onClick={onDeleteClose} variant="ghost" flex={1}>
                    Cancel
                  </Button>
                  <Button onClick={handleDeleteUser} colorScheme="red" flex={1}>
                    Delete User
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
      
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

export default UsersDashboard;
