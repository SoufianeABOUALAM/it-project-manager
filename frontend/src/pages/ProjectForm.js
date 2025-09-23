import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    SimpleGrid,
    Alert,
    AlertIcon,
    AlertDescription,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Flex,
    IconButton,
    Card,
    CardBody,
    Icon,
    Switch,
    Textarea,
    Badge,
    Divider,
    Spinner,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
} from '@chakra-ui/react';
import { 
    FiX, 
    FiBriefcase, 
    FiMonitor, 
    FiSettings, 
    FiWifi, 
    FiMapPin,
    FiZap,
    FiDollarSign,
    FiBarChart2
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = 'http://127.0.0.1:8000/api/projects/projects/';
const MATERIALS_API_URL = 'http://127.0.0.1:8000/api/materials/';

const ProjectForm = () => {
    const { authToken } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        company_name: '',
        entity: '',
        status: 'Draft',
        start_date: '',
        end_date: '',
        number_of_users: '',
        pc_type: '',
        num_laptop_office: 0,
        num_laptop_tech: 0,
        num_desktop_office: 0,
        num_desktop_tech: 0,
        local_apps: false,
        local_apps_list: '',
        file_server: false,
        site_addresses: '',
        gps_coordinates: '',
        internet_line_type: '',
        internet_line_speed: '',
        num_printers: 0,
        num_traceau: 0,
        num_videoconference: 0,
        visio_type: '',
        num_aps: 0,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const isEditMode = Boolean(id);
    
    // Remove materials state - not needed for frontend calculations
    // const [materials, setMaterials] = useState([]);
    // const [loadingMaterials, setLoadingMaterials] = useState(true);
    // Remove budgetItems state - not needed for frontend calculations
    // const [budgetItems, setBudgetItems] = useState([]);
    const [backendBudget, setBackendBudget] = useState(null);
    const [loadingBackendBudget, setLoadingBackendBudget] = useState(false);

    // Fetch existing project data when editing
    useEffect(() => {
        if (isEditMode && id) {
            fetchProjectData();
        }
    }, [id, isEditMode]);

    const fetchProjectData = async () => {
        if (!authToken) return;
        
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}${id}/`, {
                headers: { Authorization: `Token ${authToken}` }
            });
            
            const projectData = response.data;
            console.log('Fetched project data:', projectData);
            
            // Map the API response to form data
            setFormData({
                name: projectData.name || '',
                company_name: projectData.company_name || '',
                entity: projectData.entity || '',
                status: 'Draft', // Default status
                start_date: projectData.start_date || '',
                end_date: projectData.end_date || '',
                number_of_users: projectData.number_of_users || '',
                pc_type: projectData.pc_type || '',
                num_laptop_office: projectData.num_laptop_office || 0,
                num_laptop_tech: projectData.num_laptop_tech || 0,
                num_desktop_office: projectData.num_desktop_office || 0,
                num_desktop_tech: projectData.num_desktop_tech || 0,
                local_apps: projectData.local_apps || false,
                local_apps_list: projectData.local_apps_list || '',
                file_server: projectData.file_server || false,
                site_addresses: projectData.site_addresses || '',
                gps_coordinates: projectData.gps_coordinates || '',
                internet_line_type: projectData.internet_line_type || '',
                internet_line_speed: projectData.internet_line_speed || '',
                num_printers: projectData.num_printers || 0,
                num_traceau: projectData.num_traceau || 0,
                num_videoconference: projectData.num_videoconference || 0,
                visio_type: projectData.visio_type || '',
                num_aps: projectData.num_aps || 0,
            });
            
            // Also fetch the backend-calculated budget
            await fetchBackendBudget(id);
            
        } catch (error) {
            console.error('Error fetching project data:', error);
            setError('Failed to load project data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBackendBudget = async (projectId) => {
        if (!projectId) return;
        
        setLoadingBackendBudget(true);
        try {
            console.log('🔄 Fetching backend budget for project:', projectId);
            
            // First recalculate the budget
            await axios.post(`${API_URL}${projectId}/recalculate/`, {}, {
                headers: { Authorization: `Token ${authToken}` }
            });
            
            // Then get the budget breakdown
            const budgetResponse = await axios.get(`${API_URL}${projectId}/budget/`, {
                headers: { Authorization: `Token ${authToken}` }
            });
            
            console.log('💰 Backend budget fetched:', budgetResponse.data);
            setBackendBudget(budgetResponse.data);
            
            // Update the local budget totals with backend values
            setTotalCostFrance(parseFloat(budgetResponse.data.total_cost_france) || 0);
            setTotalCostMorocco(parseFloat(budgetResponse.data.total_cost_morocco) || 0);
            
        } catch (err) {
            console.warn('⚠️ Failed to fetch backend budget:', err);
            // Don't show error to user, just log it
        } finally {
            setLoadingBackendBudget(false);
        }
    };
    const [totalCostFrance, setTotalCostFrance] = useState(0);
    const [totalCostMorocco, setTotalCostMorocco] = useState(0);

    // Remove materials fetching - not needed for frontend calculations
    // useEffect(() => {
    //     fetchMaterials();
    // }, []);

    // Remove frontend budget calculation - all calculations now happen in backend
    // useEffect(() => {
    //     calculateBudget();
    // }, [formData, materials]);

    // Remove fetchMaterials function - not needed for frontend calculations
    // const fetchMaterials = async () => { ... };

    // Remove findMaterial function - not needed for frontend calculations
    // const findMaterial = (name) => { ... };

    // Remove frontend budget calculation - all calculations now happen in backend
    const calculateBudget = () => {
        // Frontend calculation removed - all calculations now happen in backend
        // The backend will calculate the budget when the project is created/updated
        console.log('🧮 Frontend calculation disabled - using backend API only');
    };

    const formatCurrency = (amount, currency = 'EUR') => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency === 'EUR' ? 'EUR' : 'MAD'
        }).format(amount);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        // Basic validation
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Project name is required';
        if (!formData.entity.trim()) errors.entity = 'Entity is required';
        if (!formData.start_date) errors.start_date = 'Start date is required';
        if (!formData.end_date) errors.end_date = 'End date is required';
        if (!formData.number_of_users || formData.number_of_users < 1) {
            errors.number_of_users = 'Number of users must be at least 1';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setIsSubmitting(false);
            return;
        }

        try {
            let projectId;

            if (isEditMode) {
                // Update existing project
                const updateResponse = await axios.put(`${API_URL}${id}/`, formData, {
                    headers: { Authorization: `Token ${authToken}` }
                });
                projectId = id;
                setSuccess('Project updated successfully!');
            } else {
                // Create new project
                const createResponse = await axios.post(API_URL, formData, {
                    headers: { Authorization: `Token ${authToken}` }
                });
                projectId = createResponse.data.id;
                setSuccess('Project created successfully!');
            }
            
            // After creating/updating project, recalculate budget using backend API
            console.log('🔄 Recalculating budget using backend API...');
            try {
                const recalculateResponse = await axios.post(`${API_URL}${projectId}/recalculate/`, {}, {
                    headers: { Authorization: `Token ${authToken}` }
                });
                
                console.log('✅ Budget recalculated successfully:', recalculateResponse.data);
                
                // Get the budget breakdown
                const budgetResponse = await axios.get(`${API_URL}${projectId}/budget/`, {
                    headers: { Authorization: `Token ${authToken}` }
                });
                
                console.log('💰 Budget breakdown:', budgetResponse.data);
                
                // Update the budget display with backend-calculated values
                const backendBudget = budgetResponse.data;
                
                // Show success with backend-calculated totals
                setSuccess(`Project ${isEditMode ? 'updated' : 'created'} successfully! Budget: €${backendBudget.total_cost_france} / MAD ${backendBudget.total_cost_morocco}`);
                
            } catch (budgetError) {
                console.warn('⚠️ Budget recalculation failed, but project was saved:', budgetError);
                setSuccess(`Project ${isEditMode ? 'updated' : 'created'} successfully! (Budget calculation will be updated on next page load)`);
            }
            
            setTimeout(() => navigate('/admin'), 2000);
        } catch (err) {
            console.error("Form submission failed:", err.response?.data || err.message);
            setError(err.response?.data ? JSON.stringify(err.response.data) : "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={1000}
            bg="rgba(0, 0, 0, 0.6)"
            backdropFilter="blur(10px)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
        >
            <Box
                maxW="1200px"
                w="full"
                bg="white"
                borderRadius="2xl"
                boxShadow="0 32px 64px -12px rgba(0, 0, 0, 0.35)"
                border="1px solid"
                borderColor="gray.100"
                overflow="hidden"
                maxH="95vh"
                overflowY="auto"
            >
                {/* Header */}
                <Box
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    p={8}
                    position="relative"
                    overflow="hidden"
                >
                    <Flex justify="space-between" align="center">
                        <HStack spacing={4}>
                            <Icon as={FiZap} w={8} h={8} color="orange.400" />
                            <VStack spacing={1} align="start">
                                <Heading size="xl" color="white" fontWeight="bold">
                                    {id ? 'Edit Project' : 'Create New Project'}
                                </Heading>
                                <Text color="purple.100" fontSize="md">
                                    Design your IT infrastructure project with precision
                                </Text>
                            </VStack>
                        </HStack>
                        <IconButton
                            icon={<FiX />}
                            size="lg"
                            variant="ghost" 
                            color="white"
                            _hover={{ bg: "rgba(255,255,255,0.2)" }}
                            onClick={() => navigate('/admin')}
                            borderRadius="full"
                            aria-label="Close"
                        />
                    </Flex>
                </Box>

                {/* Form Content */}
                <Box p={8} bg="gray.50">
                    {error && (
                        <Alert status="error" mb={6} borderRadius="lg">
                            <AlertIcon />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert status="success" mb={6} borderRadius="lg">
                            <AlertIcon />
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    {isLoading ? (
                        <Box textAlign="center" py={8}>
                            <Spinner size="xl" color="purple.500" />
                            <Text mt={4} color="gray.600">Loading project data...</Text>
                        </Box>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={6} align="stretch">
                            {/* Basic Information Card */}
                            <Card bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                <CardBody p={6}>
                                    <HStack mb={4}>
                                        <Icon as={FiBriefcase} w={6} h={6} color="purple.500" />
                                        <VStack align="start" spacing={0}>
                                            <Heading size="md" color="gray.700" fontWeight="semibold">Basic Information</Heading>
                                            <Text color="gray.500" fontSize="sm">Essential project details and timeline</Text>
                                        </VStack>
                                    </HStack>

                                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                                        <FormControl isRequired isInvalid={validationErrors.name}>
                                            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                Project Name **
                                            </FormLabel>
                                            <Input
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter project name"
                                                bg="white"
                                                border="2px solid"
                                                borderColor={validationErrors.name ? "red.300" : "gray.200"}
                                                borderRadius="lg"
                                                h="48px"
                                                fontSize="md"
                                                _placeholder={{ color: "gray.400" }}
                                                _focus={{ 
                                                    borderColor: "purple.500", 
                                                    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                                                    bg: "white"
                                                }}
                                                _hover={{ borderColor: "gray.300" }}
                                                transition="all 0.2s ease"
                                            />
                                            {validationErrors.name && (
                                                <Text color="red.500" fontSize="sm" mt={1}>{validationErrors.name}</Text>
                                            )}
                                        </FormControl>

                                        <FormControl isRequired isInvalid={validationErrors.entity}>
                                            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                Entity/Organization **
                                            </FormLabel>
                                            <Select
                                                name="entity"
                                                value={formData.entity}
                                                onChange={handleChange}
                                                bg="white"
                                                border="2px solid"
                                                borderColor={validationErrors.entity ? "red.300" : "gray.200"}
                                                borderRadius="lg"
                                                h="48px"
                                                fontSize="md"
                                                _focus={{ 
                                                    borderColor: "purple.500", 
                                                    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                                                    bg: "white"
                                                }}
                                                _hover={{ borderColor: "gray.300" }}
                                                transition="all 0.2s ease"
                                            >
                                                <option value="">Select entity</option>
                                                <option value="BOUYGUES_CONSTRUCTION">Bouygues Construction</option>
                                                <option value="BOUYGUES_IMMOBILIER">Bouygues Immobilier</option>
                                                <option value="COLAS">Colas</option>
                                                <option value="TF1">TF1</option>
                                                <option value="BOUYGUES_ENERGIES_SERVICES">Bouygues Energies & Services</option>
                                                <option value="EQUANS">Equans</option>
                                                <option value="BOUYGUES_TELECOM">Bouygues Telecom</option>
                                                <option value="BOUYGUES_SA">Bouygues SA (Holding)</option>
                                                <option value="OTHER">Autre</option>
                                            </Select>
                                            {validationErrors.entity && (
                                                <Text color="red.500" fontSize="sm" mt={1}>{validationErrors.entity}</Text>
                                            )}
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                Project Status
                                            </FormLabel>
                                            <Select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                                bg="white"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                borderRadius="lg"
                                                h="48px"
                                                fontSize="md"
                                                _focus={{ 
                                                    borderColor: "purple.500", 
                                                    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                                                    bg: "white"
                                                }}
                                                _hover={{ borderColor: "gray.300" }}
                                                transition="all 0.2s ease"
                                            >
                                                <option value="Draft">Draft</option>
                                                <option value="Planning">Planning</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                                <option value="On Hold">On Hold</option>
                                            </Select>
                                        </FormControl>

                                        <FormControl isRequired isInvalid={validationErrors.start_date}>
                                            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                Start Date **
                                            </FormLabel>
                                            <Input
                                                name="start_date"
                                                type="date"
                                                value={formData.start_date}
                                                onChange={handleChange}
                                                bg="white"
                                                border="2px solid"
                                                borderColor={validationErrors.start_date ? "red.300" : "gray.200"}
                                                borderRadius="lg"
                                                h="48px"
                                                fontSize="md"
                                                _focus={{ 
                                                    borderColor: "purple.500", 
                                                    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                                                    bg: "white"
                                                }}
                                                _hover={{ borderColor: "gray.300" }}
                                                transition="all 0.2s ease"
                                            />
                                            {validationErrors.start_date && (
                                                <Text color="red.500" fontSize="sm" mt={1}>{validationErrors.start_date}</Text>
                                            )}
                                        </FormControl>

                                        <FormControl isRequired isInvalid={validationErrors.end_date}>
                                            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                End Date **
                                            </FormLabel>
                                            <Input
                                                name="end_date"
                                                type="date"
                                                value={formData.end_date}
                                                onChange={handleChange}
                                                bg="white"
                                                border="2px solid"
                                                borderColor={validationErrors.end_date ? "red.300" : "gray.200"}
                                                borderRadius="lg"
                                                h="48px"
                                                fontSize="md"
                                                _focus={{ 
                                                    borderColor: "purple.500", 
                                                    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                                                    bg: "white"
                                                }}
                                                _hover={{ borderColor: "gray.300" }}
                                                transition="all 0.2s ease"
                                            />
                                            {validationErrors.end_date && (
                                                <Text color="red.500" fontSize="sm" mt={1}>{validationErrors.end_date}</Text>
                                            )}
                                        </FormControl>

                                        <FormControl isRequired isInvalid={validationErrors.number_of_users}>
                                            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                Number of Users **
                                            </FormLabel>
                                            <NumberInput
                                                value={formData.number_of_users}
                                                onChange={(value) => handleChange({ target: { name: 'number_of_users', value } })}
                                                min={1}
                                                max={10000}
                                            >
                                                <NumberInputField
                                                    placeholder="Enter number of users"
                                                    bg="white"
                                                    border="2px solid"
                                                    borderColor={validationErrors.number_of_users ? "red.300" : "gray.200"}
                                                    borderRadius="lg"
                                                    h="48px"
                                                    fontSize="md"
                                                    _placeholder={{ color: "gray.400" }}
                                                    _focus={{ 
                                                        borderColor: "purple.500", 
                                                        boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                                                        bg: "white"
                                                    }}
                                                    _hover={{ borderColor: "gray.300" }}
                                                    transition="all 0.2s ease"
                                                />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                            {validationErrors.number_of_users && (
                                                <Text color="red.500" fontSize="sm" mt={1}>{validationErrors.number_of_users}</Text>
                                            )}
                                        </FormControl>
                                    </SimpleGrid>
                                </CardBody>
                            </Card>

                            {/* PC Configuration Card */}
                            <Card bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                <CardBody p={6}>
                                    <HStack mb={4}>
                                        <Icon as={FiMonitor} w={6} h={6} color="purple.500" />
                                        <VStack align="start" spacing={0}>
                                            <Heading size="md" color="gray.700" fontWeight="semibold">PC Configuration</Heading>
                                            <Text color="gray.500" fontSize="sm">Configure PC types and quantities</Text>
                                        </VStack>
                                    </HStack>

                                    <VStack spacing={6} align="stretch">
                                        <FormControl>
                                            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                Type de PC
                                            </FormLabel>
                                            <Select
                                                name="pc_type"
                                                value={formData.pc_type}
                                                onChange={handleChange}
                                                bg="white"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                borderRadius="lg"
                                                h="48px"
                                                fontSize="md"
                                                _focus={{ 
                                                    borderColor: "purple.500", 
                                                    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                                                    bg: "white"
                                                }}
                                                _hover={{ borderColor: "gray.300" }}
                                                transition="all 0.2s ease"
                                            >
                                                <option value="">Select PC type</option>
                                                <option value="LAPTOP_ONLY">Laptop uniquement</option>
                                                <option value="DESKTOP_ONLY">Desktop uniquement</option>
                                                <option value="BOTH">Les deux</option>
                                            </Select>
                                        </FormControl>

                                        {(formData.pc_type === 'LAPTOP_ONLY' || formData.pc_type === 'BOTH') && (
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                <FormControl>
                                                    <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                        Nombre de Laptop Bureautique
                                                    </FormLabel>
                                                    <NumberInput
                                                        value={formData.num_laptop_office}
                                                        onChange={(value) => handleChange({ target: { name: 'num_laptop_office', value } })}
                                                        min={0}
                                                    >
                                                        <NumberInputField
                                                            placeholder="0"
                                                            bg="white"
                                                            border="2px solid"
                                                            borderColor="gray.200"
                                                            borderRadius="lg"
                                                            h="48px"
                                                        />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                        Nombre de Laptop Technique
                                                    </FormLabel>
                                                    <NumberInput
                                                        value={formData.num_laptop_tech}
                                                        onChange={(value) => handleChange({ target: { name: 'num_laptop_tech', value } })}
                                                        min={0}
                                                    >
                                                        <NumberInputField
                                                            placeholder="0"
                                                            bg="white"
                                                            border="2px solid"
                                                            borderColor="gray.200"
                                                            borderRadius="lg"
                                                            h="48px"
                                                        />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                </FormControl>
                                            </SimpleGrid>
                                        )}

                                        {(formData.pc_type === 'DESKTOP_ONLY' || formData.pc_type === 'BOTH') && (
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                <FormControl>
                                                    <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                        Nombre de Desktop Bureautique
                                                    </FormLabel>
                                                    <NumberInput
                                                        value={formData.num_desktop_office}
                                                        onChange={(value) => handleChange({ target: { name: 'num_desktop_office', value } })}
                                                        min={0}
                                                    >
                                                        <NumberInputField
                                                            placeholder="0"
                                                            bg="white"
                                                            border="2px solid"
                                                            borderColor="gray.200"
                                                            borderRadius="lg"
                                                            h="48px"
                                                        />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                        Nombre de Desktop Technique
                                                    </FormLabel>
                                                    <NumberInput
                                                        value={formData.num_desktop_tech}
                                                        onChange={(value) => handleChange({ target: { name: 'num_desktop_tech', value } })}
                                                        min={0}
                                                    >
                                                        <NumberInputField
                                                            placeholder="0"
                                                            bg="white"
                                                            border="2px solid"
                                                            borderColor="gray.200"
                                                            borderRadius="lg"
                                                            h="48px"
                                                        />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                </FormControl>
                                            </SimpleGrid>
                                        )}
                                    </VStack>
                                </CardBody>
                            </Card>

                            {/* Applications Card */}
                            <Card bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                <CardBody p={6}>
                                    <HStack mb={4}>
                                        <Icon as={FiSettings} w={6} h={6} color="purple.500" />
                                        <VStack align="start" spacing={0}>
                                            <Heading size="md" color="gray.700" fontWeight="semibold">Applications & Services</Heading>
                                            <Text color="gray.500" fontSize="sm">Configure local applications and file server</Text>
                                        </VStack>
                                    </HStack>

                                    <VStack spacing={6} align="stretch">
                                        <FormControl>
                                            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                Est-ce que il y a des appli locaux ?
                                            </FormLabel>
                                            <Switch
                                                name="local_apps"
                                                isChecked={formData.local_apps}
                                                onChange={(e) => handleChange({ target: { name: 'local_apps', value: e.target.checked } })}
                                                colorScheme="purple"
                                                size="lg"
                                            />
                                        </FormControl>

                                        {formData.local_apps && (
                                            <FormControl>
                                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                    Lesquelles ? (Exemple : SAGE, GMAO)
                                                </FormLabel>
                                                <Textarea
                                                    name="local_apps_list"
                                                    value={formData.local_apps_list}
                                                    onChange={handleChange}
                                                    placeholder="Describe the local applications needed..."
                                                    bg="white"
                                                    border="2px solid"
                                                    borderColor="gray.200"
                                                    borderRadius="lg"
                                                    fontSize="md"
                                                    _placeholder={{ color: "gray.400" }}
                                                    _focus={{ 
                                                        borderColor: "purple.500", 
                                                        boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                                                        bg: "white"
                                                    }}
                                                    _hover={{ borderColor: "gray.300" }}
                                                    transition="all 0.2s ease"
                                                    rows={3}
                                                />
                                            </FormControl>
                                        )}

                                        <FormControl>
                                            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                Serveur de fichiers ?
                                            </FormLabel>
                                            <Switch
                                                name="file_server"
                                                isChecked={formData.file_server}
                                                onChange={(e) => handleChange({ target: { name: 'file_server', value: e.target.checked } })}
                                                colorScheme="purple"
                                                size="lg"
                                            />
                                        </FormControl>
                                    </VStack>
                                </CardBody>
                            </Card>

                            {/* Location Information Card */}
                            <Card bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                <CardBody p={6}>
                                    <HStack mb={4}>
                                        <Icon as={FiMapPin} w={6} h={6} color="purple.500" />
                                        <VStack align="start" spacing={0}>
                                            <Heading size="md" color="gray.700" fontWeight="semibold">Location Information</Heading>
                                            <Text color="gray.500" fontSize="sm">Project site details and coordinates</Text>
                                        </VStack>
                                    </HStack>

                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                        <FormControl>
                                            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                Addresses of each site/workshop
                                            </FormLabel>
                                            <Textarea
                                                name="site_addresses"
                                                value={formData.site_addresses}
                                                onChange={handleChange}
                                                placeholder="Enter site addresses separated by commas"
                                                bg="white"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                borderRadius="lg"
                                                fontSize="md"
                                                _placeholder={{ color: "gray.400" }}
                                                _focus={{ 
                                                    borderColor: "purple.500", 
                                                    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                                                    bg: "white"
                                                }}
                                                _hover={{ borderColor: "gray.300" }}
                                                transition="all 0.2s ease"
                                                rows={3}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                Coordonnées GPS (Exemple: 24.793387, 46.654397)
                                            </FormLabel>
                                            <Textarea
                                                name="gps_coordinates"
                                                value={formData.gps_coordinates}
                                                onChange={handleChange}
                                                placeholder="Enter GPS coordinates separated by commas"
                                                bg="white"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                borderRadius="lg"
                                                fontSize="md"
                                                _placeholder={{ color: "gray.400" }}
                                                _focus={{ 
                                                    borderColor: "purple.500", 
                                                    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                                                    bg: "white"
                                                }}
                                                _hover={{ borderColor: "gray.300" }}
                                                transition="all 0.2s ease"
                                                rows={3}
                                            />
                                        </FormControl>
                                    </SimpleGrid>
                                </CardBody>
                            </Card>

                            {/* Network & Infrastructure Card */}
                            <Card bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                <CardBody p={6}>
                                    <HStack mb={4}>
                                        <Icon as={FiWifi} w={6} h={6} color="purple.500" />
                                        <VStack align="start" spacing={0}>
                                            <Heading size="md" color="gray.700" fontWeight="semibold">Network & Infrastructure</Heading>
                                            <Text color="gray.500" fontSize="sm">Configure network requirements and equipment</Text>
                                        </VStack>
                                    </HStack>

                                    <VStack spacing={6} align="stretch">
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                            <FormControl>
                                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                    Internet line Type
                                                </FormLabel>
                                                <Select
                                                    name="internet_line_type"
                                                    value={formData.internet_line_type}
                                                    onChange={handleChange}
                                                    bg="white"
                                                    border="2px solid"
                                                    borderColor="gray.200"
                                                    borderRadius="lg"
                                                    h="48px"
                                                    fontSize="md"
                                                    _focus={{ 
                                                        borderColor: "purple.500", 
                                                        boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                                                        bg: "white"
                                                    }}
                                                    _hover={{ borderColor: "gray.300" }}
                                                    transition="all 0.2s ease"
                                                >
                                                    <option value="">Select line type</option>
                                                    <option value="FO">FO</option>
                                                    <option value="VSAT">VSAT</option>
                                                    <option value="STARLINK">STARLINK</option>
                                                    <option value="AUTRE">AUTRE</option>
                                                </Select>
                                            </FormControl>


                                            <FormControl>
                                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                    Internet Speed
                                                </FormLabel>
                                                <Select
                                                    name="internet_line_speed"
                                                    value={formData.internet_line_speed}
                                                    onChange={handleChange}
                                                    bg="white"
                                                    border="2px solid"
                                                    borderColor="gray.200"
                                                    borderRadius="lg"
                                                    h="48px"
                                                    fontSize="md"
                                                    _focus={{ 
                                                        borderColor: "purple.500", 
                                                        boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                                                        bg: "white"
                                                    }}
                                                    _hover={{ borderColor: "gray.300" }}
                                                    transition="all 0.2s ease"
                                                >
                                                    <option value="">Select speed</option>
                                                    <option value="100MBps">100MBps</option>
                                                    <option value="200MBps">200MBps</option>
                                                    <option value="500MBps">500MBps</option>
                                                    <option value="1GBps">1GBps</option>
                                                </Select>
                                            </FormControl>
                                            
                                            <FormControl>
                                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                    Nombre de Traceau
                                                </FormLabel>
                                                <NumberInput
                                                    value={formData.num_traceau}
                                                    onChange={(value) => handleChange({ target: { name: 'num_traceau', value } })}
                                                    min={0}
                                                >
                                                    <NumberInputField
                                                        placeholder="0"
                                                        bg="white"
                                                        border="2px solid"
                                                        borderColor="gray.200"
                                                        borderRadius="lg"
                                                        fontSize="md"
                                                        _focus={{ 
                                                            borderColor: "purple.500", 
                                                            boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                                                            bg: "white"
                                                        }}
                                                        _hover={{ borderColor: "gray.300" }}
                                                        transition="all 0.2s ease"
                                                    />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                            </FormControl>
                                        </SimpleGrid>

                                        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                                            <FormControl>
                                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                    Nombre d'imprimante
                                                </FormLabel>
                                                <NumberInput
                                                    value={formData.num_printers}
                                                    onChange={(value) => handleChange({ target: { name: 'num_printers', value } })}
                                                    min={0}
                                                >
                                                    <NumberInputField
                                                        placeholder="0"
                                                        bg="white"
                                                        border="2px solid"
                                                        borderColor="gray.200"
                                                        borderRadius="lg"
                                                        h="48px"
                                                    />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                    Nombre de travail
                                                </FormLabel>
                                                <NumberInput
                                                    value={formData.workstations}
                                                    onChange={(value) => handleChange({ target: { name: 'workstations', value } })}
                                                    min={0}
                                                >
                                                    <NumberInputField
                                                        placeholder="0"
                                                        bg="white"
                                                        border="2px solid"
                                                        borderColor="gray.200"
                                                        borderRadius="lg"
                                                        h="48px"
                                                    />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                    Nombre de Visioconférence
                                                </FormLabel>
                                                <NumberInput
                                                    value={formData.num_videoconference}
                                                    onChange={(value) => handleChange({ target: { name: 'num_videoconference', value } })}
                                                    min={0}
                                                >
                                                    <NumberInputField
                                                        placeholder="0"
                                                        bg="white"
                                                        border="2px solid"
                                                        borderColor="gray.200"
                                                        borderRadius="lg"
                                                        h="48px"
                                                    />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                    Type de Visioconférence
                                                </FormLabel>
                                                <Select
                                                    name="visio_type"
                                                    value={formData.visio_type}
                                                    onChange={handleChange}
                                                    bg="white"
                                                    border="2px solid"
                                                    borderColor="gray.200"
                                                    borderRadius="lg"
                                                    h="48px"
                                                    placeholder="Sélectionner le type"
                                                >
                                                    <option value="HARDWARE_CODEC">Hardware codec (room system)</option>
                                                    <option value="SOFTWARE">Software (Teams/Zoom)</option>
                                                    <option value="ROOM_SYSTEM">Room system</option>
                                                    <option value="SIP_H323">SIP / H.323</option>
                                                    <option value="OTHER">Autre</option>
                                                </Select>
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                    Nombre d'AP
                                                </FormLabel>
                                                <NumberInput
                                                    value={formData.num_aps}
                                                    onChange={(value) => handleChange({ target: { name: 'num_aps', value } })}
                                                    min={0}
                                                >
                                                    <NumberInputField
                                                        placeholder="0"
                                                        bg="white"
                                                        border="2px solid"
                                                        borderColor="gray.200"
                                                        borderRadius="lg"
                                                        h="48px"
                                                    />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                            </FormControl>
                                        </SimpleGrid>
                                    </VStack>
                                </CardBody>
                            </Card>

                            {/* Budget Preview Card */}
                            <Card bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                <CardBody p={6}>
                                    <HStack mb={4} justify="space-between">
                                        <HStack>
                                        <Icon as={FiBarChart2} w={6} h={6} color="purple.500" />
                                        <VStack align="start" spacing={0}>
                                            <Heading size="md" color="gray.700" fontWeight="semibold">Budget Preview</Heading>
                                                <Text color="gray.500" fontSize="sm">
                                                    {backendBudget ? 'Backend-calculated budget' : 'Real-time cost calculation based on your inputs'}
                                                </Text>
                                        </VStack>
                                        </HStack>
                                        {isEditMode && (
                                            <Button
                                                size="sm"
                                                colorScheme="purple"
                                                variant="outline"
                                                onClick={() => fetchBackendBudget(id)}
                                                isLoading={loadingBackendBudget}
                                                loadingText="Recalculating..."
                                            >
                                                Recalculate Budget
                                            </Button>
                                        )}
                                    </HStack>

                                    {loadingBackendBudget ? (
                                        <Flex justify="center" align="center" py={8}>
                                            <VStack spacing={4}>
                                                <Spinner size="lg" color="purple.500" />
                                                <Text color="gray.600">Calculating budget...</Text>
                                            </VStack>
                                        </Flex>
                                    ) : (
                                        <VStack spacing={4} align="stretch">
                                            {/* Total Cost Summary */}
                                            <Box bg="purple.50" p={4} borderRadius="lg" border="1px solid" borderColor="purple.200">
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                    <Box textAlign="center">
                                                        <Text fontSize="sm" color="purple.600" fontWeight="medium">Total Cost (France)</Text>
                                                        <Text fontSize="2xl" color="purple.700" fontWeight="bold">
                                                            {loadingBackendBudget ? (
                                                                <HStack justify="center">
                                                                    <Spinner size="sm" color="purple.500" />
                                                                    <Text>Calculating...</Text>
                                                                </HStack>
                                                            ) : (
                                                                formatCurrency(totalCostFrance, 'EUR')
                                                            )}
                                                        </Text>
                                                    </Box>
                                                    <Box textAlign="center">
                                                        <Text fontSize="sm" color="purple.600" fontWeight="medium">Total Cost (Morocco)</Text>
                                                        <Text fontSize="2xl" color="purple.700" fontWeight="bold">
                                                            {loadingBackendBudget ? (
                                                                <HStack justify="center">
                                                                    <Spinner size="sm" color="purple.500" />
                                                                    <Text>Calculating...</Text>
                                                                </HStack>
                                                            ) : (
                                                                formatCurrency(totalCostMorocco, 'MAD')
                                                            )}
                                                        </Text>
                                                    </Box>
                                                </SimpleGrid>
                                            </Box>

                                            {/* Budget calculation now handled by backend API */}
                                            <Box textAlign="center" py={8} color="gray.500">
                                                <Icon as={FiDollarSign} w={12} h={12} mb={2} />
                                                <Text>Budget will be calculated by backend when project is saved</Text>
                                            </Box>
                                        </VStack>
                                    )}
                                </CardBody>
                            </Card>

                            {/* Action Buttons */}
                            <Flex justify="flex-end" gap={4} pt={6}>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    colorScheme="gray"
                                    size="lg"
                                    px={8}
                                    onClick={() => navigate('/admin')}
                                    borderRadius="lg"
                                    fontWeight="semibold"
                                    _hover={{ 
                                        bg: "gray.50",
                                        transform: "translateY(-1px)",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                    }}
                                    transition="all 0.2s ease"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    isLoading={isSubmitting}
                                    loadingText="Saving..."
                                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                    color="white"
                                    size="lg"
                                    px={8}
                                    borderRadius="lg"
                                    fontWeight="semibold"
                                    _hover={{ 
                                        transform: "translateY(-1px)",
                                        boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)"
                                    }}
                                    _active={{ transform: "translateY(0)" }}
                                    transition="all 0.2s ease"
                                >
                                    {id ? "Update Project" : "Create Project"}
                                </Button>
                            </Flex>
                        </VStack>
                    </form>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default ProjectForm;